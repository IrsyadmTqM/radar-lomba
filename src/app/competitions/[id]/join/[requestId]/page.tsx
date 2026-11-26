"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { freeHours } from "@/lib/matching";
import { TeamIcon, TogglePill, FormAlert, useFormError } from "@/components/ui";
import { IconClose, IconInfo, IconSend } from "@/components/Icons";

export default function JoinRequest() {
  const { id, requestId } = useParams<{ id: string; requestId: string }>();
  const router = useRouter();
  const { db, me, sendJoin, showToast } = useStore();
  const c = db.competitions.find((x) => x.id === id);
  const r = db.requests.find((x) => x.id === requestId);

  const initialRoles = r && me ? r.needed_roles.filter((x) => me.skills.includes(x)) : [];
  const [roles, setRoles] = useState<string[]>(initialRoles.length ? initialRoles : r ? [r.needed_roles[0]] : []);
  const [msg, setMsg] = useState("");
  const { error, nonce, setError, clear } = useFormError();

  if (!c || !r || !me) return null;

  const free = freeHours(db, me.id);
  const toggle = (role: string) => setRoles((cur) => (cur.includes(role) ? cur.filter((x) => x !== role) : [...cur, role]));
  const addHint = (text: string) => setMsg((m) => (m ? `${m.trimEnd()} ${text}` : text).slice(0, 300));

  function submit() {
    setError("");
    const res = sendJoin(r!.id, roles, msg);
    if (!res.ok) return setError(res.error);
    showToast(`Request sent to ${r!.title}`);
    router.push("/inbox?tab=sent");
  }

  return (
    <main className="min-h-dvh bg-ink relative" onInput={clear}>
      <div className="px-5 pt-14 h-[150px] flex flex-col gap-1 text-white opacity-50">
        <span className="text-xs">
          {c.category} · {c.subcategory}
        </span>
        <span className="text-2xl font-bold">{c.name}</span>
      </div>

      <div className="min-h-[calc(100dvh-150px)] bg-paper rounded-t-[32px] px-5 pt-3 pb-7 flex flex-col gap-4">
        <span className="self-center w-11 h-[5px] rounded-sm bg-sand" />

        <div className="flex items-center gap-3">
          <TeamIcon id={r.icon_id} size={44} radius={14} alt={r.title} />
          <div className="flex-1 flex flex-col min-w-0">
            <h1 className="m-0 text-xl font-bold">Join {r.title}</h1>
            <span className="text-xs text-muted">
              Needs {r.needed_roles.join(", ")} · min {r.min_hours_per_week} h/week
            </span>
          </div>
          <Link href={`/competitions/${c.id}`} aria-label="Close" className="w-11 h-11 rounded-[14px] bg-card flex items-center justify-center shrink-0">
            <IconClose size={18} />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">
            Join as <span className="font-medium text-muted">(pick one or more)</span>
          </span>
          <div className="flex gap-2 flex-wrap">
            {r.needed_roles.map((role) => (
              <TogglePill key={role} on={roles.includes(role)} onClick={() => toggle(role)}>
                {role}
              </TogglePill>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="msg" className="text-[13px] font-semibold">
            Message to the team
          </label>
          <textarea
            id="msg"
            value={msg}
            maxLength={300}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Introduce yourself: who you are, what you can do, and why you want to join."
            className="h-[168px] resize-none rounded-[18px] bg-card p-3.5 text-[15px] leading-normal outline-none focus:ring-2 focus:ring-ink"
          />
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-1.5 flex-wrap">
              <button type="button" onClick={() => addHint(`Hi! I'm ${me.full_name.split(" ")[0]}, ${me.major} ${me.entry_year}.`)} className="bg-sand rounded-lg px-2 py-1 text-xs">
                Who you are
              </button>
              <button type="button" onClick={() => addHint(`I can cover ${roles.join(" and ") || "..."}.`)} className="bg-sand rounded-lg px-2 py-1 text-xs">
                What you can do
              </button>
              <button type="button" onClick={() => addHint(`I can commit ${Math.min(free, me.commitment_hours_per_week)} h/week.`)} className="bg-sand rounded-lg px-2 py-1 text-xs">
                Your time
              </button>
            </div>
            <span className="text-xs text-muted shrink-0">{msg.length}/300</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl px-3.5 py-3 flex gap-2.5 items-start">
          <IconInfo size={18} className="shrink-0 mt-px" />
          <span className="text-[13px] leading-[1.45] text-muted">
            The team owner also sees your skills, hours per week and goal. You have {free} h/week free right now. Your contact stays hidden until they accept.
          </span>
        </div>

        <FormAlert message={error} nonce={nonce} />

        <button type="button" onClick={submit} className="mt-auto h-14 rounded-[18px] bg-lime flex items-center justify-center gap-2 font-bold text-base text-ink">
          <IconSend size={18} color="#1E1E1E" />
          Send request
        </button>
      </div>
    </main>
  );
}
