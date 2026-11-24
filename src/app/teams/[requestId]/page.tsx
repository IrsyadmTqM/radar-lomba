"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, BackButton, DemoTag, SectionTitle, TeamIcon, inputCls } from "@/components/ui";
import { IconChat, IconExternal, IconPlus, IconSearch } from "@/components/Icons";

export default function TeamPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const { db, me, now, setStatus, setGroupLink, leaveTeam, showToast } = useStore();
  const [linkDraft, setLinkDraft] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);

  const r = db.requests.find((x) => x.id === requestId);
  const c = r && db.competitions.find((x) => x.id === r.competition_id);
  if (!r || !c || !me) return null;

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

  function saveLink() {
    const v = linkDraft.trim();
    if (!/^https?:\/\//.test(v)) return showToast("Paste a full link starting with https://");
    setGroupLink(r!.id, v);
    setLinkDraft("");
    showToast("Group link saved");
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-32 flex flex-col gap-3.5">
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
        <div className="flex gap-2">
          {isMember && r.group_link ? (
            <a href={r.group_link} target="_blank" rel="noreferrer" className="flex-1 h-11 rounded-[14px] bg-card text-ink no-underline flex items-center justify-center gap-2 font-semibold text-sm">
              <IconChat size={18} /> Team WhatsApp
            </a>
          ) : null}
          <a href={c.link} target="_blank" rel="noreferrer" className="flex-1 h-11 rounded-[14px] bg-card text-ink no-underline flex items-center justify-center gap-2 font-semibold text-sm">
            <IconExternal size={18} /> Register
          </a>
        </div>
        {isOwner && !r.group_link && (
          <div className="flex gap-2">
            <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} placeholder="Paste team WhatsApp group link" className={`${inputCls} !h-11 !rounded-[14px] text-sm`} />
            <button type="button" onClick={saveLink} className="h-11 px-4 rounded-[14px] bg-ink text-white text-sm font-semibold shrink-0">
              Save
            </button>
          </div>
        )}
      </div>

      <SectionTitle title="Members" aside={isMember ? "Contacts visible to members only" : "Join to see contacts"} />

      <div className="bg-card rounded-[22px] px-3.5 py-1.5 flex flex-col">
        {members.map((m, i) => {
          const p = db.profiles.find((x) => x.id === m.profile_id);
          if (!p) return null;
          return (
            <div key={m.profile_id} className={`flex items-center gap-3 py-2.5 ${i < members.length - 1 || slots > 0 ? "border-b border-sand" : ""}`}>
              <Avatar id={p.avatar_id} size={40} radius={13} alt={p.full_name} />
              <div className="flex-1 flex flex-col gap-px min-w-0">
                <span className="font-semibold text-sm">
                  {p.id === me.id ? "You" : p.full_name}
                  {p.id === r.owner_id && " · Owner"} {p.is_demo && <DemoTag />}
                </span>
                <span className="text-xs text-muted">
                  {m.roles.join(" + ")} · {r.min_hours_per_week} h/week{isMember && p.contact ? ` · ${p.contact}` : ""}
                </span>
              </div>
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
          {confirmLeave ? (
            <button
              type="button"
              onClick={() => {
                leaveTeam(r.id);
                showToast(`You left ${r.title}`);
                router.push("/teams");
              }}
              className={`${isOwner ? "" : "flex-1"} h-12 px-4 rounded-2xl bg-lime-dark text-ink font-semibold text-sm`}
            >
              Tap again to leave
            </button>
          ) : (
            <button type="button" onClick={() => setConfirmLeave(true)} className={`${isOwner ? "" : "flex-1"} h-12 px-4 rounded-2xl border-[1.5px] border-sand bg-card text-ink font-semibold text-sm`}>
              Leave team
            </button>
          )}
        </div>
      )}

      {!isMember && (
        <div className="flex">
          <BackButton />
        </div>
      )}

      <BottomNav />
    </main>
  );
}
