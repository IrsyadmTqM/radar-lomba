"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { daysLeft, useStore } from "@/lib/store";
import { joinBlocker, teamInCompetition } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { BackButton, DemoTag, SectionTitle, TeamIcon } from "@/components/ui";
import { IconBookmark, IconClose, IconExternal, IconSearch } from "@/components/Icons";

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const { db, me, now, toggleSaved } = useStore();
  const [rulesOpen, setRulesOpen] = useState(false);
  const c = db.competitions.find((x) => x.id === id);
  if (!c || !me) return <NotFound />;

  const mine = teamInCompetition(db, me.id, c.id);
  const teams = db.requests.filter((r) => r.competition_id === c.id && r.status === "open" && r.id !== mine?.id);
  const saved = db.saved.includes(c.id);
  const left = daysLeft(c.registration_deadline, now);

  const findHref = mine ? (mine.owner_id === me.id ? `/teams/${mine.id}/candidates` : `/teams/${mine.id}`) : `/competitions/${c.id}/new-team`;
  const findLabel = mine ? (mine.owner_id === me.id ? "Find teammates" : "Open my team") : "Find teammates";

  return (
    <main className="min-h-dvh flex flex-col pb-28">
      <div className="bg-ink text-white rounded-b-[32px] px-5 pt-14 pb-[22px] flex flex-col gap-[18px]">
        <div className="flex justify-between">
          <BackButton href="/competitions" dark />
          <button type="button" aria-label={saved ? "Remove from saved" : "Save competition"} aria-pressed={saved} onClick={() => toggleSaved(c.id)} className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${saved ? "bg-lime" : "bg-ink-2"}`}>
            <IconBookmark color={saved ? "#1E1E1E" : "#FFFFFF"} />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-lime">
            {c.category} · {c.subcategory}
          </span>
          <h1 className="m-0 text-[28px] font-bold leading-tight">{c.name}</h1>
          <span className="text-sm text-mist">{c.organizer}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Deadline" value={left === 0 ? "Today" : `${left} day${left === 1 ? "" : "s"}`} />
          <Stat label="Team size" value={c.min_team_size === c.max_team_size ? String(c.max_team_size) : `${c.min_team_size}–${c.max_team_size}`} />
          <Stat label="Open teams" value={String(teams.length + (mine && mine.status === "open" ? 1 : 0))} />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {mine && (
          <Link href={`/teams/${mine.id}`} className="no-underline text-ink bg-lime rounded-[22px] p-4 flex items-center gap-3">
            <TeamIcon id={mine.icon_id} alt={mine.title} />
            <div className="flex-1 flex flex-col">
              <span className="text-xs">Your team for this competition</span>
              <span className="font-semibold text-[15px]">{mine.title}</span>
            </div>
            <span className="text-xs bg-ink text-lime rounded-lg px-2 py-1">{mine.status}</span>
          </Link>
        )}

        <SectionTitle title="Teams looking for people" aside={mine ? "One team per competition" : undefined} />

        {teams.length === 0 && (
          <div className="bg-card rounded-[22px] p-5 text-center flex flex-col gap-1">
            <span className="font-semibold">No open teams yet</span>
            <span className="text-sm text-muted">Be the first: post a team and invite people who fit.</span>
          </div>
        )}

        {teams.map((r) => {
          const owner = db.profiles.find((p) => p.id === r.owner_id);
          const count = db.members.filter((m) => m.request_id === r.id).length;
          const sent = db.invitations.some((i) => i.request_id === r.id && i.from_id === me.id && i.status === "pending");
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
              {r.description && <p className="m-0 text-[13px] leading-snug text-muted">{r.description}</p>}
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs text-muted">Needs</span>
                {r.needed_roles.map((role) => (
                  <span key={role} className={`rounded-lg px-2 py-1 text-xs ${me.skills.includes(role) ? "bg-lime" : "bg-sand"}`}>
                    {role}
                  </span>
                ))}
                <span className="text-xs text-muted">· min {r.min_hours_per_week} h/week</span>
              </div>
              {sent ? (
                <div className="h-11 rounded-[14px] bg-paper flex items-center justify-center text-sm font-semibold text-muted">Request sent, waiting for reply</div>
              ) : blocker ? (
                <div className="rounded-[14px] bg-paper px-3 py-2.5 text-[13px] text-muted">{blocker}</div>
              ) : (
                <Link href={`/competitions/${c.id}/join/${r.id}`} className="h-11 rounded-[14px] border-[1.5px] border-ink bg-card no-underline flex items-center justify-center font-semibold text-sm text-ink">
                  Request to join
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-[430px] bg-paper px-5 pt-4 pb-[max(28px,env(safe-area-inset-bottom))] flex gap-2.5">
          <button type="button" onClick={() => setRulesOpen(true)} className="flex-1 h-14 rounded-[18px] bg-card text-ink flex items-center justify-center font-semibold text-[15px]">
            Rules &amp; link
          </button>
          <Link href={findHref} className="flex-[1.4] h-14 rounded-[18px] bg-lime text-ink no-underline flex items-center justify-center gap-2 font-semibold text-[15px]">
            <IconSearch size={18} color="#1E1E1E" />
            {findLabel}
          </Link>
        </div>
      </div>

      {rulesOpen && (
        <div className="fixed inset-0 z-40 bg-ink/50 flex items-end" onClick={() => setRulesOpen(false)}>
          <div role="dialog" aria-label="Rules and link" className="animate-rise mx-auto w-full max-w-[430px] bg-paper rounded-t-[32px] px-5 pt-3 pb-8 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <span className="self-center w-11 h-[5px] rounded-sm bg-sand" />
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-xl font-bold">Rules &amp; link</h2>
              <button type="button" aria-label="Close" onClick={() => setRulesOpen(false)} className="w-11 h-11 rounded-[14px] bg-card flex items-center justify-center">
                <IconClose size={18} />
              </button>
            </div>
            <div className="bg-card rounded-2xl p-4 flex flex-col gap-2 text-sm leading-normal">
              <span>
                <b>Registration closes:</b> {new Date(c.registration_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span>
                <b>Team size:</b> {c.min_team_size}–{c.max_team_size} people
              </span>
              <span className="text-muted">{c.requirements}</span>
            </div>
            <a href={c.link} target="_blank" rel="noreferrer" className="h-[52px] rounded-[18px] bg-ink text-white no-underline flex items-center justify-center gap-2 font-semibold">
              <IconExternal size={18} color="#FFFFFF" /> Open official page
            </a>
            <span className="text-xs text-muted text-center">Sample competition for the demo. The link is a placeholder.</span>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-2 rounded-2xl p-2.5 flex flex-col gap-0.5">
      <span className="text-[11px] text-mist">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
}

function NotFound() {
  return (
    <main className="min-h-dvh p-6 flex flex-col items-center justify-center gap-3 text-center">
      <h1 className="m-0 text-xl font-bold">Not found</h1>
      <Link href="/competitions" className="text-ink underline">
        Back to competitions
      </Link>
    </main>
  );
}
