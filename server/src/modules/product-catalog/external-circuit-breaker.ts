import { Logger } from '@nestjs/common';

const FAILURE_THRESHOLD = 5;
const OPEN_DURATION_MS = 60_000;

export class ExternalCircuitBreaker {
  private readonly logger: Logger;
  private consecutiveFailures = 0;
  private openUntil = 0;

  constructor(private readonly providerName: string) {
    this.logger = new Logger(`CircuitBreaker:${providerName}`);
  }

  isOpen(): boolean {
    return Date.now() < this.openUntil;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  recordFailure(): void {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= FAILURE_THRESHOLD) {
      this.openUntil = Date.now() + OPEN_DURATION_MS;
      this.consecutiveFailures = 0;
      this.logger.warn(
        `${this.providerName} unavailable, skipping calls for ${OPEN_DURATION_MS / 1000}s`,
      );
    }
  }
}
