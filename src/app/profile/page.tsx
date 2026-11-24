"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { freeHours, usedHours } from "@/lib/matching";
import { GOAL_OPTIONS, SKILLS } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, TogglePill } from "@/components/ui";

export default function Profile() {
  const { db, me, updateProfile, resetDemo, showToast } = useStore();
  const router = useRouter();
  const [pickAvatar, setPickAvatar] = useState(false);
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
        <button type="button" onClick={() => setPickAvatar((v) => !v)} aria-label="Change avatar" className="rounded-[22px] shadow-[0_0_0_4px_#CEEC68]">
          <Avatar id={me.avatar_id} size={72} radius={22} alt="Your avatar" />
        </button>
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className="text-lg font-bold">{me.full_name}</span>
          <span className="text-[13px] text-muted">
            {me.major} · {me.entry_year}
          </span>
          <span className="text-[13px] text-muted truncate">{me.faculty}</span>
        </div>
      </div>

      {pickAvatar && (
        <div className="grid grid-cols-5 gap-2.5 bg-card rounded-[22px] p-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
            <button
              key={id}
              type="button"
              aria-label={`Avatar ${id}`}
              aria-pressed={id === me.avatar_id}
              onClick={() => {
                updateProfile({ avatar_id: id });
                setPickAvatar(false);
              }}
              className={`aspect-square rounded-2xl overflow-hidden border-[3px] ${id === me.avatar_id ? "border-ink" : "border-transparent"}`}
            >
              <Avatar id={id} size={80} radius={12} className="!w-full !h-full" />
            </button>
          ))}
        </div>
      )}

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
        <span className="text-[13px] font-semibold">Skills</span>
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

      <div className="bg-card rounded-2xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm">Contact</span>
        <span className="text-sm font-semibold">{me.contact}</span>
      </div>

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

      <BottomNav />
    </main>
  );
}
