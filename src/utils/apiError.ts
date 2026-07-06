export function getApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } };
  return e.response?.data?.error || fallback;
}
