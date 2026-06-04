import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "typeblitz-dev-secret-2024";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hash) => {
      if (err) reject(err);
      else resolve(`${salt}:${hash.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedHash) => {
      if (err) reject(err);
      else resolve(derivedHash.toString("hex") === hash);
    });
  });
}

export function generateToken(userId: string, username: string): string {
  const payload = JSON.stringify({ userId, username, iat: Date.now() });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const [encoded, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}
