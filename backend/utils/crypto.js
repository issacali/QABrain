import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || "";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plainText = "") {
  if (!plainText) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(cipherText = "") {
  if (!cipherText) return "";
  const [ivHex, tagHex, dataHex] = cipherText.split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
