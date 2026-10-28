import { ValidateBy, ValidationOptions } from 'class-validator';
import { isDayKey } from './day-key';

export function IsDayKey(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isDayKey',
      validator: {
        validate: (value: unknown) => isDayKey(value),
        defaultMessage: () => 'Each date must be a valid YYYY-MM-DD day',
      },
    },
    options,
  );
}
