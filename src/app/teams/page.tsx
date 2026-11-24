"use client";

import Link from "next/link";
import { daysLeft, useStore } from "@/lib/store";
import { freeHours, teamsOf, usedHours } from "@/lib/matching";
import { BottomNav } from "@/components/BottomNav";
import { TeamIcon } from "@/components/ui";

export default function MyTeams() {
  const { db, me, now } = useStore();
  if (!me) return null;
  const teams = teamsOf(db, me.id);
  const used = usedHours(db, me.id);
  const free = freeHours(db, me.id);
  const pct = Math.min(100, Math.round((used / Math.max(1, me.commitment_hours_per_week)) * 100));

  return (
    <main className="min-h-dvh px-5 pt-14 pb-32 flex flex-col gap-4">
      <h1 className="m-0 text-[28px] font-bold">My teams</h1>

      <div className="bg-ink text-white rounded-[22px] p-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm">Your time across competitions</span>
          <span className="text-sm text-lime font-semibold">{free} h/week free</span>
        </div>
        <div className="h-3 rounded-full bg-ink-2 overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={me.commitment_hours_per_week} aria-valuenow={used} aria-label="Hours used">
          <div className="h-full bg-lime rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-mist">
          {used} of {me.commitment_hours_per_week} h/week used by {teams.length} team{teams.length === 1 ? "" : "s"}. One team per competition.
        </span>
      </div>

      {teams.length === 0 && (
        <div className="bg-card rounded-[22px] p-6 text-center flex flex-col gap-2 items-center">
          <span className="font-semibold">No team yet</span>
          <span className="text-sm text-muted">Pick a competition, then join a team or post your own.</span>
          <Link href="/competitions" className="mt-2 h-12 px-5 rounded-2xl bg-lime text-ink no-underline flex items-center font-bold text-sm">
            Browse competitions
          </Link>
        </div>
      )}

      {teams.map((r) => {
        const c = db.competitions.find((x) => x.id === r.competition_id)!;
        const count = db.members.filter((m) => m.request_id === r.id).length;
        const myRoles = db.members.find((m) => m.request_id === r.id && m.profile_id === me.id)?.roles ?? [];
        return (
          <Link key={r.id} href={`/teams/${r.id}`} className="no-underline text-ink bg-card rounded-[22px] p-4 flex items-center gap-3">
            <TeamIcon id={r.icon_id} size={48} radius={15} alt={r.title} />
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-[15px]">
                {r.title}
                {r.owner_id === me.id && <span className="text-xs text-muted font-medium"> · Owner</span>}
              </span>
              <span className="text-xs text-muted truncate">
                {c.name} · {daysLeft(c.registration_deadline, now)} d left
              </span>
              <span className="text-xs text-muted">
                You: {myRoles.join(", ")} · {r.min_hours_per_week} h/week
              </span>
            </div>
            <span className={`text-xs rounded-lg px-2 py-1 ${r.status === "open" ? "bg-lime" : "bg-ink text-lime"}`}>
              {r.status} · {count}/{c.max_team_size}
            </span>
          </Link>
        );
      })}
      <BottomNav />
    </main>
  );
}
