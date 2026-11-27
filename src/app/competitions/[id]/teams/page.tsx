"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { isPast, useStore } from "@/lib/store";
import { joinBlocker } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { BackButton, DemoTag, Gone, TeamIcon } from "@/components/ui";

export default function AllTeams() {
  const { id } = useParams<{ id: string }>();
  const { db, me } = useStore();
  const c = db.competitions.find((x) => x.id === id);
  if (!me) return null;
  if (!c) return <Gone title="This competition was removed" body="It is no longer listed." href="/competitions" label="Back to competitions" />;
  if (isPast(c.registration_deadline)) return <Gone title="This competition has closed" body="Registration is over, so it is no longer listed." href="/competitions" label="Back to competitions" />;
  const teams = db.requests.filter((r) => r.competition_id === c.id && r.status === "open");
  return (
    <main className="min-h-dvh px-5 pt-7 pb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton href={`/competitions/${c.id}`} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted truncate">{c.name}</span>
          <h1 className="m-0 text-[22px] font-bold">All teams ({teams.length})</h1>
        </div>
      </div>
      {teams.map((r) => {
        const owner = db.profiles.find((p) => p.id === r.owner_id);
        const count = db.members.filter((m) => m.request_id === r.id).length;
        const blocker = joinBlocker(db, r, me.id);
        return (
          <div key={r.id} className="bg-card rounded-[22px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <TeamIcon id={r.icon_id} alt={r.title} />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="font-semibold text-[15px]">
                  {r.title} {owner?.is_demo && <DemoTag />}
                </span>
                <span className="text-xs text-muted">
                  {count} of {c.max_team_size} members · goal: {GOAL_LABEL[r.goal]}
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
              <span className="text-xs text-muted">Needs</span>
              {r.needed_roles.map((role) => (
                <span key={role} className={`rounded-lg px-2 py-1 text-xs ${me.skills.includes(role) ? "bg-lime" : "bg-sand"}`}>
                  {role}
                </span>
              ))}
            </div>
            {blocker ? (
              <div className="rounded-[14px] bg-paper px-3 py-2.5 text-[13px] text-muted">{blocker}</div>
            ) : (
              <Link href={`/competitions/${c.id}/join/${r.id}`} className="h-11 rounded-[14px] border-[1.5px] border-ink bg-card no-underline flex items-center justify-center font-semibold text-sm text-ink">
                Request to join
              </Link>
            )}
          </div>
        );
      })}
    </main>
  );
}
