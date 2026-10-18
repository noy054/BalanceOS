import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

interface TrackableRequest {
  user?: { id?: string };
  ip?: string;
}

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: TrackableRequest): Promise<string> {
    return Promise.resolve(
      req.user?.id ? `user:${req.user.id}` : `ip:${req.ip ?? 'unknown'}`,
    );
  }
}
