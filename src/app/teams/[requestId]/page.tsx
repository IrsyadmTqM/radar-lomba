"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { joinBlocker } from "@/lib/matching";
import type { InvitationStatus } from "@/lib/types";
import { Avatar, BackButton, ConfirmModal, DemoTag, Gone, SectionTitle, TeamIcon } from "@/components/ui";
import { IconBack, IconChat, IconExternal, IconPlus, IconSearch } from "@/components/Icons";

export default function TeamPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const { db, me, now, setStatus, leaveTeam, kickMember, showToast } = useStore();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [kickId, setKickId] = useState<string | null>(null);

  const r = db.requests.find((x) => x.id === requestId);
  const c = r && db.competitions.find((x) => x.id === r.competition_id);
  if (!me) return null;
  if (!r || !c) return <Gone title="This team no longer exists" body="Everyone left the team, so it was deleted." href="/teams" label="Back to My teams" />;

  const members = db.members.filter((m) => m.request_id === r.id).sort((a, b) => (a.profile_id === r.owner_id ? -1 : b.profile_id === r.owner_id ? 1 : a.joined_at - b.joined_at));
  const isMember = members.some((m) => m.profile_id === me.id);
  const isOwner = r.owner_id === me.id;
  const covered = new Set(members.flatMap((m) => m.roles));
  const stillNeeded = r.needed_roles.filter((x) => !covered.has(x));
  const slots = Math.max(0, c.max_team_size - members.length);

  const ms = Math.max(0, new Date(c.registration_deadline).getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const statusText = r.status === "open" ? "Open" : r.status === "full" ? "Full" : "Complete";

  const blocker = isMember ? null : joinBlocker(db, r, me.id);
  const requested = db.invitations.some((i) => i.request_id === r.id && i.from_id === me.id && i.status === "pending");
  // Owner sees every invite or join request for this team and where it stands.
  const sentInvites = isOwner ? db.invitations.filter((i) => i.request_id === r.id).sort((a, b) => b.created_at - a.created_at) : [];
  const btn = "flex-1 min-w-[45%] h-11 rounded-[14px] bg-card text-ink no-underline flex items-center justify-center gap-2 font-semibold text-sm";

  return (
    <main className="min-h-dvh px-5 pt-7 pb-32 flex flex-col gap-3.5">
      <div className="bg-lime rounded-[26px] p-[18px] flex flex-col gap-3.5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TeamIcon id={r.icon_id} size={52} radius={16} alt={r.title} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <Link href={`/competitions/${c.id}`} className="text-xs text-ink no-underline truncate">
                {c.name}
              </Link>
              <h1 className="m-0 text-[26px] font-bold leading-tight">{r.title}</h1>
            </div>
          </div>
          <span className="bg-ink text-lime rounded-[10px] px-2.5 py-1.5 text-xs shrink-0">
            {statusText} · {members.length}/{c.max_team_size}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs">Registration closes in</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              [pad(d), "days"],
              [pad(h), "hours"],
              [pad(min), "minutes"],
            ].map(([v, l]) => (
              <div key={l} className="bg-ink text-white rounded-[14px] p-2 flex flex-col items-center">
                <span className="text-2xl font-bold">{v}</span>
                <span className="text-[11px] text-mist">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isMember && r.group_link && (
            <a href={r.group_link} target="_blank" rel="noreferrer" className={`${btn} !bg-ink !text-white`}>
              <IconChat size={18} /> Team WhatsApp
            </a>
          )}
          <a href={c.link} target="_blank" rel="noreferrer" className={btn}>
            <IconExternal size={18} /> Official site
          </a>
          {c.poster && (
            <Link href={`/competitions/${c.id}/poster`} className={btn}>
              View poster
            </Link>
          )}
        </div>
        {isOwner && !r.group_link && (
          <Link href={`/teams/${r.id}/edit`} className="h-11 rounded-[14px] border-[1.5px] border-dashed border-ink text-ink no-underline flex items-center justify-center text-sm font-semibold">
            Add the team WhatsApp group link
          </Link>
        )}
      </div>

      {isOwner && (
        <Link href={`/teams/${r.id}/edit`} className="self-start no-underline text-ink bg-card rounded-xl h-10 px-4 flex items-center font-semibold text-sm">
          Edit team
        </Link>
      )}

      <SectionTitle title="Members" />

      <div className="bg-card rounded-[22px] px-3.5 py-1.5 flex flex-col">
        {members.map((m, i) => {
          const p = db.profiles.find((x) => x.id === m.profile_id);
          if (!p) return null;
          return (
            <div key={m.profile_id} className={`flex items-center gap-2 py-2.5 ${i < members.length - 1 || slots > 0 ? "border-b border-sand" : ""}`}>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <Link href={p.id === me.id ? "/profile" : `/users/${p.id}?team=${r.id}`} className="group flex items-center gap-3 no-underline text-ink rounded-xl -mx-1.5 px-1.5 py-1 hover:bg-paper">
                  <Avatar id={p.avatar_id} size={40} radius={13} alt={p.full_name} />
                  <div className="flex-1 flex flex-col gap-px min-w-0">
                    <span className="font-bold text-[15px]">
                      {p.full_name}
                      {p.id === me.id && " (you)"}
                      {p.id === r.owner_id && " · Owner"} {p.is_demo && <DemoTag />}
                    </span>
                    <span className="text-xs text-muted">
                      {m.roles.length ? m.roles.join(" + ") : "Member"} · {r.min_hours_per_week} h/week
                    </span>
                  </div>
                  <IconBack size={16} className="rotate-180 text-muted shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              {isOwner && p.id !== me.id && (
                <button
                  type="button"
                  aria-label={`Remove ${p.full_name}`}
                  onClick={() => setKickId(p.id)}
                  className="shrink-0 h-9 px-3 rounded-xl text-xs font-semibold border-[1.5px] border-sand text-ink"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
        {slots > 0 && (
          <div className="flex items-center gap-3 py-2.5">
            <div className="w-10 h-10 rounded-[13px] border-[1.5px] border-dashed border-olive flex items-center justify-center shrink-0">
              <IconPlus size={18} color="#686961" />
            </div>
            <span className="flex-1 text-sm text-muted">
              {slots} slot{slots > 1 ? "s" : ""} open{stillNeeded.length ? `: ${stillNeeded.join(", ")}` : ""}
            </span>
          </div>
        )}
      </div>

      {isOwner && sentInvites.length > 0 && (
        <>
          <SectionTitle title="Invites and requests" />
          <div className="bg-card rounded-[22px] px-3.5 py-1.5 flex flex-col">
            {sentInvites.map((inv, i) => {
              const other = db.profiles.find((x) => x.id === (inv.type === "invite" ? inv.to_id : inv.from_id));
              if (!other) return null;
              return (
                <div key={inv.id} className={`flex items-center gap-3 py-2.5 ${i < sentInvites.length - 1 ? "border-b border-sand" : ""}`}>
                  <Avatar id={other.avatar_id} size={36} radius={12} alt={other.full_name} />
                  <div className="flex-1 flex flex-col gap-px min-w-0">
                    <span className="font-semibold text-sm truncate">{other.full_name}</span>
                    <span className="text-xs text-muted">
                      {inv.type === "invite" ? "You invited" : "Asked to join"} · {inv.roles.join(", ")}
                    </span>
                  </div>
                  <InviteStatus status={inv.status} />
                </div>
              );
            })}
          </div>
          {sentInvites.some((i) => i.status === "pending" && i.type === "join") && (
            <Link href="/inbox" className="self-start text-xs underline text-ink">
              Answer join requests in your Inbox
            </Link>
          )}
        </>
      )}

      {isOwner && r.status === "open" && (
        <Link href={`/teams/${r.id}/candidates`} className="h-12 rounded-2xl bg-lime text-ink no-underline flex items-center justify-center gap-2 font-semibold text-sm">
          <IconSearch size={18} color="#1E1E1E" /> Find people for open slots
        </Link>
      )}

      {isMember && (
        <div className="flex gap-2">
          {isOwner &&
            (r.status === "open" ? (
              <button
                type="button"
                onClick={() => {
                  setStatus(r.id, "closed");
                  showToast("Team marked complete. No new requests.");
                }}
                className="flex-1 h-12 rounded-2xl bg-ink text-white font-semibold text-sm"
              >
                We&apos;re complete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (members.length >= c.max_team_size) return showToast("The team is at max size. Someone has to leave first.");
                  setStatus(r.id, "open");
                  showToast("Team reopened");
                }}
                className="flex-1 h-12 rounded-2xl bg-ink text-white font-semibold text-sm"
              >
                Reopen team
              </button>
            ))}
          <button type="button" onClick={() => setConfirmLeave(true)} className={`${isOwner ? "" : "flex-1"} h-12 px-4 rounded-2xl border-[1.5px] border-sand bg-card text-ink font-semibold text-sm`}>
            Leave team
          </button>
        </div>
      )}

      {!isMember &&
        (requested ? (
          <div className="h-12 rounded-2xl bg-card flex items-center justify-center text-sm font-semibold text-muted">Request sent, waiting for reply</div>
        ) : blocker ? (
          <div className="rounded-2xl bg-card px-4 py-3 text-[13px] text-muted">{blocker}</div>
        ) : (
          <Link href={`/competitions/${c.id}/join/${r.id}`} className="h-12 rounded-2xl bg-ink text-white no-underline flex items-center justify-center font-semibold text-sm">
            Request to join
          </Link>
        ))}
      {!isMember && (
        <div className="flex">
          <BackButton />
        </div>
      )}

      {confirmLeave && (
        <ConfirmModal
          title={`Leave ${r.title}?`}
          body="Your slot opens again for someone else. You can still request to join later."
          confirmLabel="Leave"
          danger
          onCancel={() => setConfirmLeave(false)}
          onConfirm={() => {
            leaveTeam(r.id);
            showToast(`You left ${r.title}`);
            router.push("/teams");
          }}
        />
      )}
      {kickId && (
        <ConfirmModal
          title="Remove this member?"
          body={`${db.profiles.find((x) => x.id === kickId)?.full_name ?? "They"} will be removed and can't request to join this team again.`}
          confirmLabel="Remove"
          danger
          onCancel={() => setKickId(null)}
          onConfirm={() => {
            const res = kickMember(r.id, kickId);
            showToast(res.ok ? "Member removed" : res.error);
            setKickId(null);
          }}
        />
      )}
      <BottomNav />
    </main>
  );
}

function InviteStatus({ status }: { status: InvitationStatus }) {
  if (status === "pending") return <span className="text-[11px] bg-sand rounded-md px-2 py-1 shrink-0">Waiting for reply</span>;
  if (status === "accepted") return <span className="text-[11px] bg-lime rounded-md px-2 py-1 shrink-0 font-semibold">Accepted</span>;
  return <span className="text-[11px] bg-paper text-muted rounded-md px-2 py-1 shrink-0">Declined</span>;
}
