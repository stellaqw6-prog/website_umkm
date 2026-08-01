// Rate limiter sederhana berbasis memori. Cocok untuk skala UMKM/single-instance.
// Catatan: karena disimpan di memori proses, counter akan reset setiap kali server
// di-redeploy/restart (wajar untuk Vercel serverless), tapi tetap efektif menahan
// percobaan brute-force yang terjadi dalam satu window waktu berjalan.

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}

export function getClientKey(req: Request, prefix: string) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:${ip}`;
}
