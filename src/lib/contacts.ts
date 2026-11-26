import type { Profile } from "./types";

/** Digits only, Indonesian 08xx turned into 628xx for wa.me links. */
export function waDigits(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.startsWith("0") ? `62${d.slice(1)}` : d;
}

/** 9 to 15 digits after cleaning, starting with 0, 62 or +62. */
export function isValidWhatsapp(raw: string) {
  const t = raw.trim();
  if (!/^\+?[\d\s-]+$/.test(t)) return false;
  const d = waDigits(t);
  return d.startsWith("62") && d.length >= 10 && d.length <= 15;
}

export const cleanHandle = (raw: string) => raw.trim().replace(/^@/, "");

export function isValidInstagram(raw: string) {
  return !raw.trim() || /^[A-Za-z0-9._]{1,30}$/.test(cleanHandle(raw));
}

export function isValidLinkedin(raw: string) {
  const t = raw.trim();
  return !t || /^https?:\/\/(www\.)?linkedin\.com\/\S+$/i.test(t) || /^[A-Za-z0-9-]{3,100}$/.test(t);
}

export function linkedinUrl(raw: string) {
  const t = raw.trim();
  return /^https?:\/\//i.test(t) ? t : `https://www.linkedin.com/in/${t}`;
}

export type ContactLink = { kind: "WhatsApp" | "Instagram" | "LinkedIn"; label: string; href: string };

export function contactLinks(p: Pick<Profile, "whatsapp" | "instagram" | "linkedin">): ContactLink[] {
  const out: ContactLink[] = [];
  if (p.whatsapp) out.push({ kind: "WhatsApp", label: p.whatsapp, href: `https://wa.me/${waDigits(p.whatsapp)}` });
  if (p.instagram) out.push({ kind: "Instagram", label: `@${cleanHandle(p.instagram)}`, href: `https://instagram.com/${cleanHandle(p.instagram)}` });
  if (p.linkedin) out.push({ kind: "LinkedIn", label: p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/i, "").replace(/\/$/, ""), href: linkedinUrl(p.linkedin) });
  return out;
}
