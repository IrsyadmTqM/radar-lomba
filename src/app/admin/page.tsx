"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { daysLeft, useStore } from "@/lib/store";
import { IconPlus, IconTrophy } from "@/components/Icons";

export default function ManageCompetitions() {
  const router = useRouter();
  const { db, me, now, removeCompetition, setHidden, signOut, showToast } = useStore();
  const [tab, setTab] = useState<"official" | "students">("official");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  if (!me) return null;

  const list = db.competitions.filter((c) => (tab === "students") === !!c.student_added).sort((a, b) => a.registration_deadline.localeCompare(b.registration_deadline));
  const teamCount = (id: string) => db.requests.filter((r) => r.competition_id === id).length;

  return (
    <main className="min-h-dvh px-5 pt-7 pb-32 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/radar-lomba-logo.png" alt="Radar Lomba" className="h-[34px] w-auto" />
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="h-11 px-4 rounded-[14px] bg-card text-sm font-semibold"
        >
          Sign out
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Admin</span>
        <h1 className="m-0 text-[28px] leading-[1.15] font-bold">Manage competitions</h1>
        <p className="m-0 text-sm text-muted leading-normal">Tap + to add an official competition. Students can also add their own, you can hide wrong or duplicate ones.</p>
      </div>
      <div className="flex gap-2">
        {(["official", "students"] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`h-9 px-3.5 rounded-[10px] text-[13px] ${tab === t ? "bg-lime" : "bg-card"}`}>
            {t === "official" ? "Official" : "Added by students"}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {list.length === 0 && <div className="bg-card rounded-[20px] p-5 text-center text-sm text-muted">Nothing here yet.</div>}
        {list.map((c) => {
          const left = daysLeft(c.registration_deadline, now);
          const teams = teamCount(c.id);
          return (
            <div key={c.id} className="bg-card rounded-[20px] p-3 flex items-center gap-3">
              {c.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.poster} alt="" className="w-14 h-14 rounded-[14px] object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-[14px] bg-sand flex items-center justify-center shrink-0 text-ink">
                  <IconTrophy />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="font-semibold text-sm truncate">{c.name}</span>
                <span className="text-xs text-muted">
                  {c.category} · {left < 0 ? "closed" : `${left} d left`} · {teams} team{teams === 1 ? "" : "s"}
                </span>
                {c.hidden && <span className="text-[11px] text-muted">Hidden from students</span>}
                {db.competitions.some((o) => o.id !== c.id && o.name.trim().toLowerCase() === c.name.trim().toLowerCase()) && <span className="text-[11px] font-semibold">Possible duplicate</span>}
                {teams > 0 && !c.student_added && <span className="text-[11px] text-muted">Has teams, can&apos;t be removed</span>}
              </div>
              {c.student_added && (
                <button
                  type="button"
                  onClick={() => {
                    setHidden(c.id, !c.hidden);
                    showToast(c.hidden ? "Visible again" : "Hidden from students");
                  }}
                  className="h-9 px-3 rounded-xl text-xs font-semibold shrink-0 border-[1.5px] border-sand"
                >
                  {c.hidden ? "Unhide" : "Hide"}
                </button>
              )}
              {teams === 0 && !c.student_added && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDel !== c.id) return setConfirmDel(c.id);
                    removeCompetition(c.id);
                    setConfirmDel(null);
                    showToast("Competition removed");
                  }}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold shrink-0 ${confirmDel === c.id ? "bg-ink text-white" : "border-[1.5px] border-sand"}`}
                >
                  {confirmDel === c.id ? "Confirm" : "Remove"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="mx-auto max-w-[430px] px-5 pb-[max(24px,env(safe-area-inset-bottom))] flex justify-end">
          <Link href="/admin/new" aria-label="Add a competition" className="pointer-events-auto w-16 h-16 rounded-[22px] bg-lime text-ink flex items-center justify-center shadow-[0_8px_24px_rgba(30,30,30,0.18)]">
            <IconPlus size={28} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </main>
  );
}
