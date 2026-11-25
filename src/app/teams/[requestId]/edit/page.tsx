"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SKILLS } from "@/lib/types";
import { BackButton, Field, PrimaryArrowButton, TogglePill, inputCls, teamIconSrc } from "@/components/ui";

export default function EditTeam() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const { db, me, updateRequest, showToast } = useStore();
  const r = db.requests.find((x) => x.id === requestId);
  const [title, setTitle] = useState(r?.title ?? "");
  const [icon, setIcon] = useState(r?.icon_id ?? 1);
  const [needed, setNeeded] = useState<string[]>(r?.needed_roles ?? []);
  const [desc, setDesc] = useState(r?.description ?? "");
  if (!r || !me || r.owner_id !== me.id) return null;
  const covered = new Set(db.members.filter((m) => m.request_id === r.id).flatMap((m) => m.roles));

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href={`/teams/${r.id}`} />
        <h1 className="m-0 text-[22px] font-bold">Edit team</h1>
      </div>
      <Field label="Team name">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" aria-label={`Team image ${n}`} aria-pressed={n === icon} onClick={() => setIcon(n)} className={`aspect-square rounded-[18px] p-[3px] ${n === icon ? "bg-lime" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamIconSrc(n)} alt="" className="w-full h-full block rounded-[15px] border-2 border-ink box-border" />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Roles you need</span>
        <div className="flex flex-wrap gap-2">
          {SKILLS.filter((s) => !covered.has(s) || needed.includes(s)).map((s) => (
            <TogglePill key={s} on={needed.includes(s)} onClick={() => setNeeded((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))}>
              {s}
            </TogglePill>
          ))}
        </div>
      </div>
      <Field label="What are you building?">
        <textarea value={desc} maxLength={200} onChange={(e) => setDesc(e.target.value)} className="h-24 resize-none rounded-2xl bg-card p-3.5 text-[15px] leading-normal outline-none focus:ring-2 focus:ring-ink" />
      </Field>
      <div className="mt-auto">
        <PrimaryArrowButton
          onClick={() => {
            if (title.trim().length < 3) return showToast("Give your team a name");
            if (!needed.length) return showToast("Pick at least one role you need");
            updateRequest(r.id, { title: title.trim(), icon_id: icon, needed_roles: needed, description: desc.trim() });
            showToast("Team updated");
            router.push(`/teams/${r.id}`);
          }}
        >
          Save
        </PrimaryArrowButton>
      </div>
    </main>
  );
}
