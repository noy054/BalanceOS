import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseBarcodePipe } from '../../common/barcode/parse-barcode.pipe';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import { UserPublic } from '../users/types/user.types';
import { BarcodeService } from './barcode.service';
import { BarcodeResolveResult } from './types/barcode.types';

const RESOLVE_LIMIT_PER_MINUTE = 30;

@UseGuards(JwtGuard, UserThrottlerGuard)
@Controller('barcode')
export class BarcodeController {
  constructor(private readonly service: BarcodeService) {}

  // Throttled: an unknown barcode can trigger external API calls (shared, rate-limited quota)
  @Throttle({ default: { limit: RESOLVE_LIMIT_PER_MINUTE, ttl: 60_000 } })
  @Get(':barcode/resolve')
  resolve(
    @CurrentUser() user: UserPublic,
    @Param('barcode', ParseBarcodePipe) barcode: NormalizedBarcode,
  ): Promise<BarcodeResolveResult> {
    return this.service.resolve(user.id, barcode);
  }
}
