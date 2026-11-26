"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { freeHours } from "@/lib/matching";
import { GOAL_OPTIONS, SKILLS, type Goal } from "@/lib/types";
import { BackButton, Field, PrimaryArrowButton, TogglePill, inputCls, teamIconSrc, FormAlert, useFormError, textareaCls } from "@/components/ui";
import { IconCheck } from "@/components/Icons";

export default function NewTeam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { db, me, createRequest, showToast } = useStore();
  const c = db.competitions.find((x) => x.id === id);

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(4);
  const [myRoles, setMyRoles] = useState<string[]>(me?.skills ?? []);
  const [needed, setNeeded] = useState<string[]>([]);
  const [minHours, setMinHours] = useState(8);
  const [goal, setGoal] = useState<Goal>(me?.commitment_goal ?? "finalist");
  const [desc, setDesc] = useState("");
  const { error, nonce, setError, clear } = useFormError();

  if (!c || !me) return null;
  const free = freeHours(db, me.id);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit() {
    setError("");
    if (title.trim().length < 3) return setError("Give your team a name.");
    if (!myRoles.length) return setError("Pick the role you cover.");
    if (!needed.length) return setError("Pick at least one role you need.");
    if (minHours > free) return setError(`You only have ${free} h/week free. Lower the minimum or free up time first.`);
    const res = createRequest({
      competition_id: c!.id,
      title: title.trim().startsWith("Team") ? title.trim() : `Team ${title.trim()}`,
      icon_id: icon,
      my_roles: myRoles,
      needed_roles: needed,
      min_hours_per_week: minHours,
      goal,
      description: desc.trim(),
    });
    if (!res.ok) return setError(res.error);
    showToast("Team posted. Here are people who fit.");
    router.replace(`/teams/${res.id}/candidates`);
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center gap-3">
        <BackButton href={`/competitions/${c.id}`} />
        <div className="flex flex-col">
          <span className="text-xs text-muted">{c.name}</span>
          <h1 className="m-0 text-[22px] font-bold">Create a team</h1>
        </div>
      </div>

      <Field label="Team name">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ombak" className={inputCls} />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Team image</span>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const on = n === icon;
            return (
              <button key={n} type="button" aria-label={`Team image ${n}${on ? ", selected" : ""}`} aria-pressed={on} onClick={() => setIcon(n)} className={`relative aspect-square rounded-[18px] p-[3px] ${on ? "bg-lime" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamIconSrc(n)} alt="" className="w-full h-full block rounded-[15px] border-2 border-ink box-border" />
                {on && (
                  <span className="absolute right-0 bottom-0 w-5 h-5 rounded-[7px] bg-ink flex items-center justify-center">
                    <IconCheck size={12} color="#CEEC68" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">
          You cover <span className="font-medium text-muted">(from your profile)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {me.skills.map((s) => (
            <span key={s} className="h-[38px] px-3.5 rounded-xl text-[13px] flex items-center bg-ink text-lime font-bold">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">
          Roles you need <span className="font-medium text-muted">(one person can cover several)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {SKILLS.filter((s) => !myRoles.includes(s)).map((s) => (
            <TogglePill key={s} on={needed.includes(s)} onClick={() => toggle(needed, setNeeded, s)}>
              {s}
            </TogglePill>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-[20px] p-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">Minimum hours per week</span>
          <span className="text-2xl font-bold">{minHours} h</span>
        </div>
        <input type="range" min={2} max={20} value={minHours} onChange={(e) => setMinHours(Number(e.target.value))} className="w-full accent-[#1E1E1E]" aria-label="Minimum hours per week" />
        <span className="text-xs text-muted">Each member, you included, commits at least this much. You have {free} h/week free.</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Team goal</span>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button key={g.value} type="button" aria-pressed={goal === g.value} onClick={() => setGoal(g.value)} className={`rounded-2xl px-2 py-3 text-[13px] font-semibold leading-tight ${goal === g.value ? "bg-ink text-lime" : "bg-card"}`}>
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <Field label="What are you building? (optional)">
        <textarea value={desc} maxLength={200} onChange={(e) => setDesc(e.target.value)} placeholder="One or two lines about your idea." className={textareaCls} />
      </Field>

      <FormAlert message={error} nonce={nonce} />

      <PrimaryArrowButton onClick={submit}>Create team and find people</PrimaryArrowButton>
    </main>
  );
}
