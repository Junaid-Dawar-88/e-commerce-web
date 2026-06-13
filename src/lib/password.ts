import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Password hashing with Node's built-in scrypt (salted). Stored as `salt:hash`.
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

// Generate a readable random password (avoids ambiguous chars like O/0/l/1).
export function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;

  const hashed = scryptSync(password, salt, KEY_LENGTH);
  const keyBuffer = Buffer.from(key, "hex");

  // Length check guards timingSafeEqual against mismatched buffer sizes.
  if (keyBuffer.length !== hashed.length) return false;
  return timingSafeEqual(hashed, keyBuffer);
}
