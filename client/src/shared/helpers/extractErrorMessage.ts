import { isAxiosError } from 'axios';

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
