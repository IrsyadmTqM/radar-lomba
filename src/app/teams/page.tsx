"use client";

import Link from "next/link";
import { useState } from "react";
import { daysLeft, useStore } from "@/lib/store";
import { freeHours, joinBlocker, teamsOf, usedHours } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import { DemoTag, SectionTitle, TeamIcon } from "@/components/ui";
import { IconClose, IconSearch } from "@/components/Icons";

export default function MyTeams() {
  const { db, me, now } = useStore();
  const [q, setQ] = useState("");
  if (!me) return null;
  const teams = teamsOf(db, me.id);
  const used = usedHours(db, me.id);
  const free = freeHours(db, me.id);
  const query = q.trim().toLowerCase();
  const mineIds = new Set(teams.map((t) => t.id));
  // Search every open team directly, without going through a competition first.
  const found = query
    ? db.requests
        .filter((r) => r.status === "open" && !mineIds.has(r.id))
        .map((r) => ({ r, c: db.competitions.find((x) => x.id === r.competition_id) }))
        .filter((x): x is { r: typeof x.r; c: NonNullable<typeof x.c> } => !!x.c && !x.c.hidden && daysLeft(x.c.registration_deadline, now) >= 0)
        .filter(({ r, c }) => `${r.title} ${c.name} ${r.needed_roles.join(" ")}`.toLowerCase().includes(query))
    : [];
  const pct = Math.min(100, Math.round((used / Math.max(1, me.commitment_hours_per_week)) * 100));

  return (
    <main className="min-h-dvh px-5 pt-7 pb-32 flex flex-col gap-4">
      <h1 className="m-0 text-[28px] font-bold">My teams</h1>

      <label className="h-12 rounded-2xl bg-sand flex items-center gap-2.5 px-3.5 focus-within:ring-2 focus-within:ring-ink transition-shadow">
        <IconSearch size={18} color="#686961" />
        <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={50} placeholder="Find a team by name, competition or role" aria-label="Find a team" className="border-none bg-transparent text-[15px] text-ink outline-none w-full" />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink">
            <IconClose size={14} />
          </button>
        )}
      </label>

      {query && (
        <div className="flex flex-col gap-2.5 animate-fade">
          <SectionTitle title={`${found.length} open team${found.length === 1 ? "" : "s"}`} aside="Across all competitions" />
          {found.length === 0 && (
            <div className="bg-card rounded-[22px] p-5 text-center flex flex-col gap-1">
              <span className="font-semibold">No open team matches</span>
              <span className="text-sm text-muted">Try a team name, a competition or a role like Design.</span>
            </div>
          )}
          {found.map(({ r, c }) => {
            const owner = db.profiles.find((p) => p.id === r.owner_id);
            const count = db.members.filter((m) => m.request_id === r.id).length;
            const blocker = joinBlocker(db, r, me.id);
            return (
              <Link key={r.id} href={`/teams/${r.id}`} className="animate-rise no-underline text-ink bg-card rounded-[22px] p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <TeamIcon id={r.icon_id} size={44} radius={14} alt={r.title} />
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-[15px]">
                      {r.title} {owner?.is_demo && <DemoTag />}
                    </span>
                    <span className="text-xs text-muted truncate">
                      {c.name} · {count}/{c.max_team_size} · goal: {GOAL_LABEL[r.goal]}
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
                <span className={`text-xs ${blocker ? "text-muted" : "font-semibold"}`}>{blocker ?? "You can request to join →"}</span>
              </Link>
            );
          })}
          <SectionTitle title="Your teams" />
        </div>
      )}

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
