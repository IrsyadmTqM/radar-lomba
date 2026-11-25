"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { freeHours, usedHours } from "@/lib/matching";
import { GOAL_OPTIONS, SKILLS } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, ConfirmModal, TogglePill } from "@/components/ui";
import { IconPlus } from "@/components/Icons";
import { PortfolioList } from "@/components/PortfolioList";

export default function Profile() {
  const { db, me, updateProfile, resetDemo, signOut, removePortfolio, showToast } = useStore();
  const router = useRouter();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!me) return null;

  const used = usedHours(db, me.id);
  const free = freeHours(db, me.id);

  const toggleSkill = (s: string) => {
    const next = me.skills.includes(s) ? me.skills.filter((x) => x !== s) : [...me.skills, s];
    if (!next.length) return showToast("Keep at least one skill");
    updateProfile({ skills: next });
  };

  return (
    <main className="min-h-dvh px-5 pt-14 pb-32 flex flex-col gap-4">
      <h1 className="m-0 text-[28px] font-bold">Profile</h1>

      <div className="bg-card rounded-[24px] p-4 flex items-center gap-4">
        <Link href="/profile/edit" aria-label="Edit profile" className="rounded-[22px] shadow-[0_0_0_4px_#CEEC68]">
          <Avatar id={me.avatar_id} size={72} radius={22} alt="Your avatar" />
        </Link>
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className="text-lg font-bold">{me.full_name}</span>
          <span className="text-[13px] text-muted">
            {me.major} · {me.entry_year}
          </span>
          <span className="text-[13px] text-muted truncate">{me.faculty}</span>
        </div>
      </div>

      <div className="bg-ink text-white rounded-[22px] p-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm">Hours per week</span>
          <span className="text-2xl font-bold">{me.commitment_hours_per_week} h</span>
        </div>
        <input
          type="range"
          min={2}
          max={20}
          value={me.commitment_hours_per_week}
          onChange={(e) => updateProfile({ commitment_hours_per_week: Math.max(Number(e.target.value), used) })}
          className="w-full accent-[#CEEC68]"
          aria-label="Hours per week"
        />
        <span className="text-xs text-mist">
          {used} h used by your teams, {free} h free. You can&apos;t go below what your teams already use.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Roles</span>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <TogglePill key={s} on={me.skills.includes(s)} onClick={() => toggleSkill(s)}>
              {s}
            </TogglePill>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Goal</span>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button key={g.value} type="button" aria-pressed={me.commitment_goal === g.value} onClick={() => updateProfile({ commitment_goal: g.value })} className={`rounded-2xl px-2 py-3 text-[13px] font-semibold leading-tight ${me.commitment_goal === g.value ? "bg-ink text-lime" : "bg-card"}`}>
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">Portfolio</span>
          <Link href="/profile/portfolio/new" aria-label="Add portfolio item" className="w-9 h-9 rounded-xl bg-ink text-lime flex items-center justify-center">
            <IconPlus size={18} />
          </Link>
        </div>
        <PortfolioList items={me.portfolio ?? []} onRemove={(id) => { removePortfolio(id); showToast("Removed"); }} />
      </div>

      <div className="bg-card rounded-2xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm">Contact</span>
        <span className="text-sm font-semibold">{me.contact}</span>
      </div>

      <Link href="/profile/account" className="no-underline text-ink bg-card rounded-2xl px-4 py-3 flex justify-between items-center font-semibold text-sm">
        Account settings <span className="text-muted font-normal">{me.email ?? "demo account"}</span>
      </Link>
      <button type="button" onClick={() => setSignOutOpen(true)} className="h-12 rounded-2xl bg-ink text-white font-semibold text-sm">
        Sign out
      </button>

      <div className="mt-2 flex flex-col gap-2">
        <span className="text-xs text-muted">Preview build. Data is stored only in this browser.</span>
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true);
            resetDemo();
            router.push("/");
          }}
          className={`h-12 rounded-2xl font-semibold text-sm ${confirmReset ? "bg-lime-dark text-ink" : "bg-card border-[1.5px] border-sand"}`}
        >
          {confirmReset ? "Tap again to reset all demo data" : "Reset demo"}
        </button>
      </div>

      {signOutOpen && (
        <ConfirmModal
          title="Sign out?"
          body="You can sign back in anytime. Your data stays in this browser."
          confirmLabel="Sign out"
          onCancel={() => setSignOutOpen(false)}
          onConfirm={() => {
            signOut();
            router.push("/");
          }}
        />
      )}
      <BottomNav />
    </main>
  );
}
