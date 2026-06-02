export function checkAuth(request: Request): boolean {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  return match[1] === (import.meta.env.ADMIN_SESSION_SECRET || 'deecleaning-secret-key-2024-secure');
}

export function createSessionCookie(): string {
  const secret = import.meta.env.ADMIN_SESSION_SECRET || 'deecleaning-secret-key-2024-secure';
  return `admin_session=${secret}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return `admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}
