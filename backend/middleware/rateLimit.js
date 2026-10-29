const windowMs = 15 * 60 * 1000;
const maxAttempts = 10;
const attempts = new Map();

export const rateLimitedPaths = new Set([
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/otp/request",
  "/api/auth/otp/verify",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/change-password",
]);

export function isRateLimited(request, pathname) {
  const key = `${request.socket.remoteAddress || "unknown"}:${pathname}`;
  const current = attempts.get(key) || { count:0, resetAt:Date.now() + windowMs };
  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + windowMs;
  }
  current.count += 1;
  attempts.set(key, current);
  return current.count > maxAttempts;
}
