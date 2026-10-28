import { BadRequestException, ConflictException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsRepository } from './announcements.repository';
import { AuditService } from '../audit/audit.service';
import { UpsertAnnouncementDto } from './dto/announcement.dto';
import {
  compareVersions,
  effectiveState,
  isSafeHttpsUrl,
  matchesAudience,
} from './announcement.rules';

function dto(
  overrides: Partial<UpsertAnnouncementDto> = {},
): UpsertAnnouncementDto {
  return {
    kind: 'UPDATE',
    display: 'BANNER',
    titleHe: 'עדכון',
    titleEn: 'Update',
    bodyHe: 'גוף',
    bodyEn: 'Body',
    actionType: 'NONE',
    platforms: [],
    ...overrides,
  } as UpsertAnnouncementDto;
}

function setup() {
  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    deleteDraft: jest.fn(),
    findLiveForUser: jest.fn().mockResolvedValue([]),
  };
  const service = new AnnouncementsService(
    repo as unknown as AnnouncementsRepository,
    {} as AuditService,
  );
  return { service, repo };
}

describe('announcement rules', () => {
  it('compares dotted versions numerically', () => {
    expect(compareVersions('1.10.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareVersions('2', '2.0.0')).toBe(0);
  });

  it('accepts only plain https links', () => {
    expect(isSafeHttpsUrl('https://balanceos.app/news')).toBe(true);
    expect(isSafeHttpsUrl('http://balanceos.app')).toBe(false);
    expect(isSafeHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpsUrl('https://user:pw@evil.example')).toBe(false);
  });

  it('derives scheduled, active and expired states', () => {
    const now = new Date('2026-10-28T12:00:00Z');
    const base = { status: 'PUBLISHED' as const, expiresAt: null };
    expect(
      effectiveState(
        { ...base, publishAt: new Date('2026-10-29T00:00:00Z') },
        now,
      ),
    ).toBe('SCHEDULED');
    expect(
      effectiveState(
        { ...base, publishAt: new Date('2026-10-27T00:00:00Z') },
        now,
      ),
    ).toBe('ACTIVE');
    expect(
      effectiveState(
        {
          ...base,
          publishAt: new Date('2026-10-20T00:00:00Z'),
          expiresAt: new Date('2026-10-27T00:00:00Z'),
        },
        now,
      ),
    ).toBe('EXPIRED');
  });

  it('targets platforms and version ranges', () => {
    const row = {
      platforms: ['ios'],
      minAppVersion: '1.2.0',
      maxAppVersion: '1.4',
    };
    expect(matchesAudience(row, { platform: 'ios', appVersion: '1.3.5' })).toBe(
      true,
    );
    expect(
      matchesAudience(row, { platform: 'android', appVersion: '1.3.5' }),
    ).toBe(false);
    expect(matchesAudience(row, { platform: 'ios', appVersion: '1.5.0' })).toBe(
      false,
    );
    expect(matchesAudience(row, { platform: 'ios' })).toBe(false);
    expect(
      matchesAudience(
        { platforms: [], minAppVersion: null, maxAppVersion: null },
        {},
      ),
    ).toBe(true);
  });
});

describe('AnnouncementsService validation', () => {
  it('rejects routes outside the allowlist', () => {
    const { service } = setup();
    expect(() =>
      service.validateContent(
        dto({
          actionType: 'ROUTE',
          actionTarget: '/(app)/admin',
          actionLabelHe: 'א',
          actionLabelEn: 'A',
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it('requires labels in both languages for action buttons', () => {
    const { service } = setup();
    expect(() =>
      service.validateContent(
        dto({
          actionType: 'URL',
          actionTarget: 'https://balanceos.app',
          actionLabelEn: 'Open',
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it('clears action fields when there is no action', () => {
    const { service } = setup();
    const content = service.validateContent(
      dto({ actionTarget: 'https://balanceos.app', actionLabelEn: 'Open' }),
    );
    expect(content.actionTarget).toBeNull();
    expect(content.actionLabelEn).toBeNull();
  });

  it('rejects an end time before the start time and inverted version ranges', () => {
    const { service } = setup();
    expect(() =>
      service.validateContent(
        dto({
          publishAt: '2026-11-02T10:00:00.000Z',
          expiresAt: '2026-11-01T10:00:00.000Z',
        }),
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validateContent(
        dto({ minAppVersion: '2.0', maxAppVersion: '1.9' }),
      ),
    ).toThrow(BadRequestException);
  });

  it('only deletes drafts', async () => {
    const { service, repo } = setup();
    repo.findById.mockResolvedValue({
      id: 'a1',
      status: 'PUBLISHED',
      titleEn: 'x',
    });
    await expect(service.remove('admin', 'a1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repo.deleteDraft).not.toHaveBeenCalled();
  });

  it('filters live announcements by audience', async () => {
    const { service, repo } = setup();
    const row = {
      id: 'a1',
      kind: 'NOTICE',
      display: 'POPUP',
      titleHe: 'ה',
      titleEn: 'E',
      bodyHe: 'ב',
      bodyEn: 'B',
      actionType: 'NONE',
      actionTarget: null,
      actionLabelHe: null,
      actionLabelEn: null,
      publishAt: new Date(),
      expiresAt: null,
      receipts: [],
    };
    repo.findLiveForUser.mockResolvedValue([
      {
        ...row,
        platforms: ['android'],
        minAppVersion: null,
        maxAppVersion: null,
      },
      {
        ...row,
        id: 'a2',
        platforms: [],
        minAppVersion: '1.0.0',
        maxAppVersion: null,
      },
    ]);
    const result = await service.activeForUser('u1', {
      platform: 'ios',
      appVersion: '1.0.0',
    });
    expect(result.map((item) => item.id)).toEqual(['a2']);
  });
});
