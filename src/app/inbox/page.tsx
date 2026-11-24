"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useStore, visibleInvitations } from "@/lib/store";
import { freeHours } from "@/lib/matching";
import { GOAL_LABEL, type Invitation } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, DemoTag, TeamIcon } from "@/components/ui";
import { IconCheck, IconClose, IconClock } from "@/components/Icons";

export default function InboxPage() {
  return (
    <Suspense>
      <Inbox />
    </Suspense>
  );
}

function Inbox() {
  const { db, me, now, respond, showToast } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") === "sent" ? "sent" : "received";
  if (!me) return null;

  const invs = visibleInvitations(db, now);
  const received = invs.filter((i) => i.to_id === me.id && i.status === "pending").sort((a, b) => b.created_at - a.created_at);
  const sent = invs.filter((i) => i.from_id === me.id).sort((a, b) => b.created_at - a.created_at);
  const earlier = db.notices.filter((n) => n.to_id === me.id).sort((a, b) => b.created_at - a.created_at);

  const team = (id: string) => db.requests.find((r) => r.id === id);
  const person = (id: string) => db.profiles.find((p) => p.id === id);
  const comp = (id: string) => db.competitions.find((c) => c.id === id);

  function answer(inv: Invitation, accept: boolean) {
    const r = team(inv.request_id);
    const max = r ? (comp(r.competition_id)?.max_team_size ?? 4) : 4;
    const willBeFull = r ? db.members.filter((m) => m.request_id === r.id).length + 1 >= max : false;
    const res = respond(inv.id, accept);
    if (!res.ok) return showToast(res.error);
    if (!accept) return showToast("Declined");
    if (willBeFull) return router.push(`/teams/${inv.request_id}/ready`);
    if (inv.type === "invite") {
      showToast(`You joined ${r?.title}`);
      router.push(`/teams/${inv.request_id}`);
    } else {
      showToast(`${person(inv.from_id)?.full_name} joined ${r?.title}`);
    }
  }

  const isEmpty = tab === "received" ? received.length === 0 && earlier.length === 0 : sent.length === 0;

  return (
    <main className="min-h-dvh px-5 pt-14 pb-32 flex flex-col gap-4">
      <h1 className="m-0 text-[28px] font-bold">Inbox</h1>

      <div role="tablist" className="h-12 rounded-2xl bg-sand p-1 flex gap-1">
        <Link role="tab" aria-selected={tab === "received"} href="/inbox" replace className={`flex-1 rounded-xl flex items-center justify-center text-sm no-underline text-ink ${tab === "received" ? "bg-card font-semibold" : ""}`}>
          Received · {received.length}
        </Link>
        <Link role="tab" aria-selected={tab === "sent"} href="/inbox?tab=sent" replace className={`flex-1 rounded-xl flex items-center justify-center text-sm no-underline text-ink ${tab === "sent" ? "bg-card font-semibold" : ""}`}>
          Sent · {sent.length}
        </Link>
      </div>

      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-center px-3 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/empty-inbox.svg" alt="An empty inbox tray" className="w-60 h-auto" />
          <h2 className="m-0 text-[22px] font-bold">{tab === "received" ? "No invitations yet" : "Nothing sent yet"}</h2>
          <p className="m-0 text-[15px] leading-normal text-muted">Open a competition and ask to join a team, or post your own request to start inviting people.</p>
          <Link href="/competitions" className="mt-1.5 h-[52px] px-6 rounded-2xl bg-lime text-ink no-underline flex items-center font-bold text-[15px]">
            Browse competitions
          </Link>
        </div>
      )}

      {tab === "received" &&
        received.map((inv) => {
          const r = team(inv.request_id);
          const from = person(inv.from_id);
          const c = r && comp(r.competition_id);
          if (!r || !from || !c) return null;
          return (
            <div key={inv.id} className="animate-rise bg-card rounded-[22px] p-4 flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                {inv.type === "invite" ? <TeamIcon id={r.icon_id} size={44} radius={14} alt={r.title} /> : <Avatar id={from.avatar_id} alt={from.full_name} />}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className={`text-[11px] rounded-md px-1.5 py-0.5 self-start ${inv.type === "invite" ? "bg-lime" : "bg-sand"}`}>{inv.type === "invite" ? "Invite" : "Join request"}</span>
                  {inv.type === "invite" ? (
                    <span className="text-sm leading-snug">
                      <b>{r.title}</b> {from.is_demo && <DemoTag />} invited you as <b>{inv.roles.join(", ")}</b> for {c.name}
                    </span>
                  ) : (
                    <span className="text-sm leading-snug">
                      <b>{from.full_name}</b> {from.is_demo && <DemoTag />} wants to join <b>{r.title}</b> as {inv.roles.join(", ")}
                    </span>
                  )}
                  {inv.type === "join" && (
                    <span className="text-[13px] text-muted">
                      {from.major} · {freeHours(db, from.id)} h/week free · goal: {GOAL_LABEL[from.commitment_goal]}
                    </span>
                  )}
                  {inv.message && <span className="text-[13px] text-muted leading-snug">&ldquo;{inv.message}&rdquo;</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => answer(inv, false)} className="flex-1 h-11 rounded-[14px] border-[1.5px] border-sand bg-card font-semibold text-sm">
                  Decline
                </button>
                <button type="button" onClick={() => answer(inv, true)} className="flex-1 h-11 rounded-[14px] bg-ink text-white font-semibold text-sm">
                  Accept
                </button>
              </div>
            </div>
          );
        })}

      {tab === "received" && earlier.length > 0 && (
        <>
          <span className="text-xs text-muted mt-1">Earlier</span>
          {earlier.map((n) => (
            <Link key={n.id} href={`/teams/${n.request_id}`} className="no-underline text-ink bg-card rounded-[18px] px-3.5 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.kind === "accepted" || n.kind === "full" ? "bg-lime" : "bg-sand"}`}>
                {n.kind === "accepted" || n.kind === "full" ? <IconCheck size={18} strokeWidth={2.2} /> : <IconClose size={16} />}
              </div>
              <span className="flex-1 text-[13px] leading-snug">{n.text}</span>
            </Link>
          ))}
        </>
      )}

      {tab === "sent" &&
        sent.map((inv) => {
          const r = team(inv.request_id);
          const to = person(inv.to_id);
          if (!r || !to) return null;
          return (
            <div key={inv.id} className="bg-card rounded-[20px] p-3.5 flex items-center gap-3">
              {inv.type === "invite" ? <Avatar id={to.avatar_id} alt={to.full_name} /> : <TeamIcon id={r.icon_id} size={44} radius={14} alt={r.title} />}
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="text-sm leading-snug">{inv.type === "invite" ? <>Invited <b>{to.full_name}</b> to {r.title}</> : <>Asked to join <b>{r.title}</b></>}</span>
                <span className="text-xs text-muted">as {inv.roles.join(", ")}</span>
              </div>
              <StatusPill status={inv.status} />
            </div>
          );
        })}

      <BottomNav />
    </main>
  );
}

function StatusPill({ status }: { status: Invitation["status"] }) {
  if (status === "pending")
    return (
      <span className="text-[11px] bg-sand rounded-md px-1.5 py-1 flex items-center gap-1">
        <IconClock size={12} /> Waiting
      </span>
    );
  if (status === "accepted") return <span className="text-[11px] bg-lime rounded-md px-1.5 py-1">Accepted</span>;
  return <span className="text-[11px] bg-paper text-muted rounded-md px-1.5 py-1">Declined</span>;
}
