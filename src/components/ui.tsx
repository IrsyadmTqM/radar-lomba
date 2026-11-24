"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack, IconCheck, IconDash } from "./Icons";

export function avatarSrc(id: number) {
  return `/avatars/av${String(id).padStart(2, "0")}.svg`;
}
export function teamIconSrc(id: number) {
  return `/team-icons/t${String(id).padStart(2, "0")}.svg`;
}

export function Avatar({ id, size = 44, radius = 14, alt = "", className = "" }: { id: number; size?: number; radius?: number; alt?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarSrc(id)} alt={alt} width={size} height={size} className={`block shrink-0 ${className}`} style={{ width: size, height: size, borderRadius: radius }} />
  );
}

/** Team images always carry a 2px ink border. */
export function TeamIcon({ id, size = 40, radius = 13, alt = "" }: { id: number; size?: number; radius?: number; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={teamIconSrc(id)} alt={alt} width={size} height={size} className="block shrink-0 border-2 border-ink box-border" style={{ width: size, height: size, borderRadius: radius }} />
  );
}

export function BackButton({ href, dark = false, label = "Back" }: { href?: string; dark?: boolean; label?: string }) {
  const router = useRouter();
  const cls = `w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${dark ? "bg-ink-2 text-white" : "bg-card text-ink"}`;
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls}>
        <IconBack />
      </Link>
    );
  return (
    <button type="button" aria-label={label} onClick={() => router.back()} className={cls}>
      <IconBack />
    </button>
  );
}

export function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${ok ? "bg-ink" : "bg-sand"}`}>
        {ok ? <IconCheck size={16} color="#CEEC68" /> : <IconDash size={14} color="#686961" />}
      </span>
      <span className={`text-sm ${ok ? "font-semibold" : "text-muted"}`}>{text}</span>
    </div>
  );
}

export function DemoTag({ light = false }: { light?: boolean }) {
  return <span className={`text-[11px] font-medium rounded-md px-1.5 py-0.5 align-middle ${light ? "bg-card" : "bg-paper"}`}>Demo</span>;
}

export function Chip({ children, tone = "sand" }: { children: React.ReactNode; tone?: "sand" | "lime" | "white" | "ink" }) {
  const map = { sand: "bg-sand", lime: "bg-lime", white: "bg-card", ink: "bg-ink text-lime" };
  return <span className={`${map[tone]} rounded-lg px-2.5 py-1 text-xs`}>{children}</span>;
}

/** Multi-select pill used for roles and skills. */
export function TogglePill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-[38px] px-3.5 rounded-xl text-[13px] flex items-center gap-1.5 transition-colors ${on ? "bg-ink text-lime font-bold" : "bg-card text-ink font-medium"}`}
    >
      {on && <IconCheck size={14} color="#CEEC68" />}
      {children}
    </button>
  );
}

export function PrimaryArrowButton({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-[18px] bg-ink text-white flex items-center justify-between pl-[22px] pr-2 font-bold text-base disabled:opacity-40"
    >
      {children}
      <span className="w-[42px] h-[42px] rounded-[14px] bg-lime flex items-center justify-center text-ink">
        <IconArrowInline />
      </span>
    </button>
  );
}

function IconArrowInline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls = "h-[52px] rounded-2xl bg-card px-4 text-[15px] text-ink outline-none focus:ring-2 focus:ring-ink w-full";

export function SectionTitle({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
      {aside && <span className="text-xs text-muted text-right">{aside}</span>}
    </div>
  );
}
