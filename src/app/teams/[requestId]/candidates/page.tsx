"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { candidatesFor, type Match } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { Avatar, BackButton, CheckRow, DemoTag, SectionTitle } from "@/components/ui";

export default function Candidates() {
  const { requestId } = useParams<{ requestId: string }>();
  const { db, me, sendInvite, showToast } = useStore();
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const r = db.requests.find((x) => x.id === requestId);
  const c = r && db.competitions.find((x) => x.id === r.competition_id);
  if (!r || !c || !me) return null;

  const all = candidatesFor(db, r);
  const list = roleFilter.length ? all.filter((m) => roleFilter.every((x) => m.profile.skills.includes(x))) : all;
  const members = db.members.filter((m) => m.request_id === r.id).length;
  const isOwner = r.owner_id === me.id;

  const invitedIds = new Set(db.invitations.filter((i) => i.request_id === r.id && i.type === "invite" && i.status === "pending").map((i) => i.to_id));

  function invite(m: Match) {
    const res = sendInvite(
      r!.id,
      m.profile.id,
      m.matchedRoles,
      `Hi ${m.profile.full_name.split(" ")[0]}! We need ${m.matchedRoles.join(" and ")} for ${c!.name}. We aim for ${GOAL_LABEL[r!.goal]}, about ${r!.min_hours_per_week} h/week.`,
    );
    if (!res.ok) return showToast(res.error);
    showToast(`Invite sent to ${m.profile.full_name}`);
  }

  const expanded = (m: Match, i: number) => (openId ? openId === m.profile.id : i === 0);

  return (
    <main className="min-h-dvh px-5 pt-14 pb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton href={`/teams/${r.id}`} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted truncate">
            {c.name} · {r.title}
          </span>
          <h1 className="m-0 text-[22px] font-bold">Find teammates</h1>
        </div>
      </div>

      {r.status !== "open" && (
        <div className="bg-sand rounded-2xl px-4 py-3 text-sm">
          This team is <b>{r.status}</b>, so new invites are paused.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted">Roles you need · tap to filter</span>
        <div className="flex gap-2 flex-wrap">
          {r.needed_roles.map((role) => {
            const on = roleFilter.includes(role);
            return (
              <button key={role} type="button" aria-pressed={on} onClick={() => setRoleFilter((cur) => (on ? cur.filter((x) => x !== role) : [...cur, role]))} className={`h-[34px] px-3 rounded-[10px] text-xs ${on ? "bg-ink text-lime font-semibold" : "bg-lime"}`}>
                {role}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-sand rounded-[10px] px-2.5 py-[7px] text-xs">Min {r.min_hours_per_week} h/week</span>
          <span className="bg-sand rounded-[10px] px-2.5 py-[7px] text-xs">Goal: {GOAL_LABEL[r.goal]}</span>
          <span className="bg-sand rounded-[10px] px-2.5 py-[7px] text-xs">
            {members} of {c.max_team_size} members
          </span>
        </div>
      </div>

      <SectionTitle title={`${list.length} match${list.length === 1 ? "" : "es"}`} aside="Best fit first" />

      {list.length === 0 && (
        <div className="bg-card rounded-[22px] p-5 text-center flex flex-col gap-1">
          <span className="font-semibold">Nobody fits yet</span>
          <span className="text-sm text-muted">People already in a team for this competition, or without enough free hours, are hidden. Try fewer filters or a lower minimum.</span>
        </div>
      )}

      {list.map((m, i) => {
        const open = expanded(m, i);
        const invited = invitedIds.has(m.profile.id);
        const canInvite = isOwner && r.status === "open";
        if (!open)
          return (
            <button key={m.profile.id} type="button" onClick={() => setOpenId(m.profile.id)} className="text-left bg-card rounded-[20px] p-3.5 flex items-center gap-3">
              <Avatar id={m.profile.avatar_id} alt={m.profile.full_name} />
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="font-semibold text-[15px]">
                  {m.profile.full_name} {m.profile.is_demo && <DemoTag />}
                </span>
                <span className="text-xs text-muted">
                  {m.matchedRoles.length}/{r.needed_roles.length} roles · {m.free} h/week free · {GOAL_LABEL[m.profile.commitment_goal]}
                  {m.otherTeams > 0 && ` · in ${m.otherTeams} other team${m.otherTeams > 1 ? "s" : ""}`}
                </span>
              </div>
              {invited && <span className="text-[11px] bg-sand rounded-md px-1.5 py-0.5">Invited</span>}
            </button>
          );
        return (
          <div key={m.profile.id} className="bg-lime rounded-3xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar id={m.profile.avatar_id} size={52} radius={16} alt={m.profile.full_name} />
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="font-semibold text-base">
                  {m.profile.full_name} {m.profile.is_demo && <DemoTag light />}
                </span>
                <span className="text-xs">
                  {m.profile.major} · {m.profile.entry_year}
                </span>
              </div>
            </div>
            {m.profile.bio && <p className="m-0 text-[13px] leading-snug">{m.profile.bio}</p>}
            <div className="bg-card rounded-2xl px-3.5 py-3 flex flex-col gap-2">
              {m.reasons.map((x) => (
                <CheckRow key={x.text} ok={x.ok} text={x.text} />
              ))}
            </div>
            <Link href={`/users/${m.profile.id}?team=${r.id}`} className="text-center text-sm underline text-ink">
              View full profile
            </Link>
            {canInvite &&
              (invited ? (
                <div className="h-[46px] rounded-[14px] bg-card/70 flex items-center justify-center text-sm font-semibold">Invite sent, waiting for reply</div>
              ) : (
                <button type="button" onClick={() => invite(m)} className="h-[46px] rounded-[14px] bg-ink text-white font-semibold text-sm">
                  Send invite
                </button>
              ))}
          </div>
        );
      })}
    </main>
  );
}
