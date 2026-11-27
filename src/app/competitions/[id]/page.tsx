"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { daysLeft, useStore } from "@/lib/store";
import { joinBlocker, teamInCompetition } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { BackButton, DemoTag, RewardTags, SectionTitle, TeamIcon } from "@/components/ui";
import { IconBookmark, IconExternal, IconPlus } from "@/components/Icons";

const PREVIEW_TEAMS = 3;

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const { db, me, now, toggleSaved } = useStore();
  const c = db.competitions.find((x) => x.id === id);
  if (!c || !me) return <NotFound />;

  const mine = teamInCompetition(db, me.id, c.id);
  const teams = db.requests.filter((r) => r.competition_id === c.id && r.status === "open" && r.id !== mine?.id);
  const saved = db.saved.includes(c.id);
  const left = daysLeft(c.registration_deadline, now);

  const findHref = mine ? (mine.owner_id === me.id ? `/teams/${mine.id}/candidates` : `/teams/${mine.id}`) : `/competitions/${c.id}/new-team`;
  const findLabel = mine ? (mine.owner_id === me.id ? "Find teammates" : "Open my team") : "Create a team";
  const owned = c.added_by === me.id && c.student_added;

  return (
    <main className="min-h-dvh flex flex-col pb-28">
      <div className="bg-ink text-white rounded-b-[32px] px-5 pt-7 pb-[22px] flex flex-col gap-[18px]">
        <div className="flex justify-between">
          <BackButton href="/competitions" dark />
          <div className="flex gap-2">
          {owned && (
            <Link href={`/competitions/${c.id}/edit`} aria-label="Edit competition" className="w-11 h-11 rounded-[14px] bg-ink-2 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
            </Link>
          )}
          <button type="button" aria-label={saved ? "Remove from saved" : "Save competition"} aria-pressed={saved} onClick={() => toggleSaved(c.id)} className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${saved ? "bg-lime" : "bg-ink-2"}`}>
            <IconBookmark color={saved ? "#1E1E1E" : "#FFFFFF"} />
          </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-lime">
            {c.category} · {c.subcategory}
          </span>
          <h1 className="m-0 text-[28px] font-bold leading-tight">{c.name}</h1>
          <span className="text-sm text-mist">{c.organizer}</span>
          {(c.rewards.length > 0 || c.student_added) && (
            <div className="flex gap-1.5 flex-wrap items-center pt-1.5">
              {c.student_added && (
                <span className="inline-flex items-center rounded-[10px] border border-dashed border-mist text-mist px-2 py-[3px] text-[11px] font-semibold">Added by student</span>
              )}
              <RewardTags rewards={c.rewards} tone="lime" />
            </div>
          )}
        </div>
        {c.poster && (
          <Link href={`/competitions/${c.id}/poster`} className="h-11 rounded-[14px] bg-ink-2 text-white no-underline flex items-center justify-center font-semibold text-sm">
            View poster
          </Link>
        )}
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

        <div className="bg-card rounded-[22px] p-4 flex flex-col gap-2 text-sm leading-normal">
          <span>
            <b>Registration closes:</b> {new Date(c.registration_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          {c.requirements && <span className="text-muted">{c.requirements}</span>}
        </div>

        <SectionTitle title="Teams looking for people" aside={mine ? "One team per competition" : undefined} />

        {teams.length === 0 && (
          <div className="bg-card rounded-[22px] p-5 text-center flex flex-col gap-1">
            <span className="font-semibold">No open teams yet</span>
            <span className="text-sm text-muted">Be the first: post a team and invite people who fit.</span>
          </div>
        )}

        {teams.slice(0, PREVIEW_TEAMS).map((r) => {
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

      {teams.length > PREVIEW_TEAMS && (
        <Link href={`/competitions/${c.id}/teams`} className="mx-5 mb-3 h-12 rounded-2xl bg-card no-underline text-ink flex items-center justify-center font-semibold text-sm">
          See all {teams.length} teams
        </Link>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-[430px] bg-paper px-5 pt-4 pb-[max(28px,env(safe-area-inset-bottom))] flex gap-2.5">
          <a href={c.link} target="_blank" rel="noreferrer" className="flex-1 h-14 rounded-[18px] bg-card text-ink no-underline flex items-center justify-center gap-2 font-semibold text-[15px]">
            <IconExternal size={18} /> Official site
          </a>
          <Link href={findHref} className="flex-[1.4] h-14 rounded-[18px] bg-lime text-ink no-underline flex items-center justify-center gap-2 font-semibold text-[15px]">
            <IconPlus size={18} color="#1E1E1E" />
            {findLabel}
          </Link>
        </div>
      </div>

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
      <h1 className="m-0 text-xl font-bold">This competition was removed</h1>
      <p className="m-0 text-sm text-muted">It is no longer listed.</p>
      <Link href="/competitions" className="mt-2 h-12 px-5 rounded-2xl bg-ink text-white no-underline flex items-center font-semibold text-sm">
        Back to competitions
      </Link>
    </main>
  );
}
