"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconBack, IconCheck, IconClose, IconDash, IconEye, IconEyeOff, IconTrophy, IconUser } from "./Icons";
import type { ContactLink } from "@/lib/contacts";

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
  const cls = `group w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${dark ? "bg-ink-2 text-white" : "bg-card text-ink"}`;
  const icon = <IconBack className="transition-transform duration-200 group-hover:-translate-x-0.5" />;
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls}>
        {icon}
      </Link>
    );
  return (
    <button type="button" aria-label={label} onClick={() => router.back()} className={cls}>
      {icon}
    </button>
  );
}

export function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${ok ? "bg-ink" : "bg-sand"}`}>
        {ok ? <IconCheck size={16} color="#CEEC68" className="animate-pop" /> : <IconDash size={14} color="#686961" />}
      </span>
      <span className={`text-sm transition-colors duration-200 ${ok ? "font-semibold" : "text-muted"}`}>{text}</span>
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
      className={`h-[38px] px-3.5 rounded-xl text-[13px] flex items-center gap-1.5 ${on ? "bg-ink text-lime font-bold" : "bg-card text-ink font-medium"}`}
    >
      {on && <IconCheck size={14} color="#CEEC68" className="animate-pop" />}
      {children}
    </button>
  );
}

export type SubmitState = "idle" | "loading" | "success";

/**
 * Main call-to-action. Hover nudges the arrow, press squishes,
 * `state` swaps the arrow for a spinner (loading) or a check (success).
 */
export function PrimaryArrowButton({
  children,
  onClick,
  disabled,
  type = "button",
  state = "idle",
  doneLabel = "Done",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  state?: SubmitState;
  doneLabel?: string;
}) {
  const busy = state !== "idle";
  return (
    <button
      type={type}
      onClick={busy ? (e) => e.preventDefault() : onClick}
      disabled={disabled}
      aria-busy={state === "loading" || undefined}
      aria-disabled={busy || undefined}
      className={`group w-full h-14 rounded-[18px] bg-ink text-white flex items-center justify-between pl-[22px] pr-2 font-bold text-base ${busy ? "pointer-events-none" : ""}`}
    >
      <span className="relative">
        <span className={`block transition-all duration-200 ${state === "success" ? "opacity-0 -translate-y-2" : ""}`}>{children}</span>
        <span aria-live="polite" className={`absolute left-0 top-0 whitespace-nowrap transition-all duration-200 ${state === "success" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          {state === "success" ? doneLabel : ""}
        </span>
      </span>
      <span className="w-[42px] h-[42px] rounded-[14px] bg-lime flex items-center justify-center text-ink transition-transform duration-200 group-hover:scale-105">
        {state === "loading" ? (
          <span role="status" aria-label="Loading" className="w-[18px] h-[18px] rounded-full border-[2.5px] border-ink/25 border-t-ink animate-spin" />
        ) : state === "success" ? (
          <IconCheck size={20} color="#1E1E1E" className="animate-pop" />
        ) : (
          <IconArrowInline />
        )}
      </span>
    </button>
  );
}

function IconArrowInline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Drives PrimaryArrowButton through loading -> success.
 * `task` returns false to drop back to idle (e.g. the store rejected it).
 */
export function useSubmitState() {
  const [state, setState] = useState<SubmitState>("idle");
  const run = useCallback(async (task: () => boolean | void) => {
    setState("loading");
    await wait(450);
    if (task() === false) {
      setState("idle");
      return false;
    }
    setState("success");
    await wait(420);
    return true;
  }, []);
  return { state, run };
}

/**
 * Form error with an optional field pointer. Each new error bumps `nonce`,
 * so the alert shakes again even when the same message fires twice. The
 * invalid field (matched by its `name`) is focused and nudged.
 * Wire `clear` to the form's onInput so editing hides the message.
 */
export function useFormError() {
  const [s, setS] = useState<{ error: string; field?: string; nonce: number }>({ error: "", nonce: 0 });
  const setError = useCallback((error: string, field?: string) => {
    setS((cur) => (error ? { error, field, nonce: cur.nonce + 1 } : cur.error ? { error: "", nonce: cur.nonce } : cur));
    if (error && field) {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[name="${field}"], [data-field="${field}"]`);
        if (!el) return;
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.animate?.(
          [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }],
          { duration: 320, easing: "ease-in-out" },
        );
      });
    }
  }, []);
  const clear = useCallback(() => setS((cur) => (cur.error ? { error: "", nonce: cur.nonce } : cur)), []);
  const invalid = (name: string) => (s.error !== "" && s.field === name) || undefined;
  return { error: s.error, nonce: s.nonce, setError, clear, invalid };
}

/** Validation message: slides open with a short shake, collapses when cleared. */
export function FormAlert({ message, nonce }: { message: string; nonce: number }) {
  const [shown, setShown] = useState(message);
  const [gap, setGap] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const open = message !== "";
  useEffect(() => {
    if (message) setShown(message);
  }, [message]);
  // While collapsed, cancel the parent's flex gap so the hidden alert takes no space.
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (parent) setGap(parseFloat(getComputedStyle(parent).rowGap) || 0);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden={!open}
      style={{ marginBottom: open ? 0 : -gap }}
      className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="overflow-hidden">
        <p key={nonce} role={open ? "alert" : undefined} className={`m-0 flex items-start gap-2 text-sm font-semibold text-danger bg-danger-soft rounded-xl px-3 py-2.5 ${open ? "animate-shake" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="shrink-0 mt-px">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5h.01" />
          </svg>
          <span>{shown}</span>
        </p>
      </div>
    </div>
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
export const textareaCls = "h-24 resize-none rounded-2xl bg-card p-3.5 text-[15px] leading-normal outline-none focus:ring-2 focus:ring-ink";

export function SectionTitle({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
      {aside && <span className="text-xs text-muted text-right">{aside}</span>}
    </div>
  );
}

/** Centered confirm popup (replaces tap-twice confirms). Esc cancels. */
export function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel, danger = false }: { title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cancel = useRef(onCancel);
  cancel.current = onCancel;
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="animate-fade fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center px-6" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-rise w-full max-w-[340px] bg-paper rounded-[28px] p-5 flex flex-col gap-3 shadow-[0_20px_50px_rgba(30,30,30,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 text-xl font-bold">{title}</h2>
        <p className="m-0 text-sm leading-normal text-muted">{body}</p>
        <div className="flex gap-2.5 pt-1">
          <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl bg-card text-ink font-semibold text-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={`flex-1 h-12 rounded-2xl font-semibold text-sm ${danger ? "bg-ink text-white" : "bg-lime text-ink"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reward tags carry a trophy and a solid fill so they never read like the
 * plain info tags (category, team size). `tone="lime"` for dark backgrounds.
 */
export function RewardTags({ rewards, max, tone = "ink" }: { rewards: string[]; max?: number; tone?: "ink" | "lime" }) {
  const list = max ? rewards.slice(0, max) : rewards;
  const cls = tone === "lime" ? "bg-lime text-ink" : "bg-ink text-lime";
  return (
    <>
      {list.map((r) => (
        <span key={r} className={`${cls} rounded-[10px] pl-2 pr-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1 max-w-full`}>
          <IconTrophy size={12} strokeWidth={2.4} className="shrink-0" />
          <span className="truncate">{r}</span>
        </span>
      ))}
    </>
  );
}

/** Marks competitions a student added (not the organizer or an admin). */
export function StudentLabel() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[10px] border border-dashed border-olive text-muted px-2 py-[3px] text-[11px] font-semibold">
      <IconUser size={11} strokeWidth={2.4} />
      Added by student
    </span>
  );
}

/** Plain info tag (category, team size, counts). */
export function InfoTag({ children }: { children: React.ReactNode }) {
  return <span className="bg-paper rounded-[10px] px-2.5 py-1 text-xs">{children}</span>;
}

/** Password field with a show / hide toggle on the right. */
export function PasswordInput({ value, onChange, name, invalid, autoComplete = "current-password", placeholder }: { value: string; onChange: (v: string) => void; name?: string; invalid?: boolean; autoComplete?: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        aria-invalid={invalid || undefined}
        value={value}
        maxLength={64}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputCls} pr-14`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-ink"
      >
        {show ? <IconEyeOff size={20} /> : <IconEye size={20} />}
      </button>
    </div>
  );
}

/** Shown when a page points at something that was deleted. */
export function Gone({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <main className="min-h-dvh px-6 flex flex-col items-center justify-center gap-3 text-center">
      <span className="w-14 h-14 rounded-2xl bg-sand flex items-center justify-center">
        <IconClose size={24} />
      </span>
      <h1 className="m-0 text-xl font-bold">{title}</h1>
      <p className="m-0 text-sm text-muted leading-normal max-w-[300px]">{body}</p>
      <Link href={href} className="mt-2 h-12 px-5 rounded-2xl bg-ink text-white no-underline flex items-center font-semibold text-sm">
        {label}
      </Link>
    </main>
  );
}

/** WhatsApp / Instagram / LinkedIn as tappable rows. */
export function ContactList({ links, compact = false }: { links: ContactLink[]; compact?: boolean }) {
  if (!links.length) return null;
  return (
    <div className={`flex ${compact ? "flex-wrap gap-1.5" : "flex-col gap-2"}`}>
      {links.map((l) => (
        <a
          key={l.kind}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className={compact ? "bg-paper rounded-lg px-2 py-1 text-[11px] font-semibold text-ink no-underline" : "bg-card rounded-2xl px-4 py-3 flex justify-between items-center no-underline text-ink"}
        >
          {compact ? (
            `${l.kind}: ${l.label}`
          ) : (
            <>
              <span className="text-sm">{l.kind}</span>
              <span className="text-sm font-semibold truncate max-w-[60%]">{l.label}</span>
            </>
          )}
        </a>
      ))}
    </div>
  );
}

/** Shallow "did anything change?" check for edit forms. */
export function useDirty<T>(current: T, initial: T) {
  const [base] = useState(() => JSON.stringify(initial));
  return JSON.stringify(current) !== base;
}

export const initialsOf = (s: string) =>
  s
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
