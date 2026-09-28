import { isAxiosError } from 'axios'

// Pull a message out of an API error,
// generic message if the backend did not send one.
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error as string
  }
  return fallback
}