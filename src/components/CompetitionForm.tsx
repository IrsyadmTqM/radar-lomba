"use client";

import { useState } from "react";
import { CATEGORIES, type Competition } from "@/lib/types";
import type { NewCompetition } from "@/lib/store";
import { Field, PrimaryArrowButton, inputCls } from "@/components/ui";
import { IconClose } from "@/components/Icons";

/** Shared form for students adding or editing a competition. */
export function CompetitionForm({ initial, submitLabel, onSubmit }: { initial?: Competition; submitLabel: string; onSubmit: (c: NewCompetition) => string | null }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [organizer, setOrganizer] = useState(initial?.organizer ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? CATEGORIES[0]);
  const [sub, setSub] = useState(initial?.subcategory ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [deadline, setDeadline] = useState(initial?.registration_deadline.slice(0, 10) ?? "");
  const [min, setMin] = useState(initial?.min_team_size ?? 2);
  const [max, setMax] = useState(initial?.max_team_size ?? 3);
  const [rules, setRules] = useState(initial?.requirements ?? "");
  const [rewards, setRewards] = useState<string[]>(initial?.rewards ?? []);
  const [draft, setDraft] = useState("");
  const [poster, setPoster] = useState<string | undefined>(initial?.poster);
  const [error, setError] = useState("");

  const addReward = () => {
    const t = draft.trim();
    if (t && !rewards.includes(t)) setRewards([...rewards, t]);
    setDraft("");
  };

  function readPoster(f: File | undefined) {
    if (!f) return;
    if (f.size > 1_500_000) return setError("Poster is too large. Use an image under 1.5 MB.");
    const r = new FileReader();
    r.onload = () => setPoster(String(r.result));
    r.readAsDataURL(f);
  }

  function submit() {
    setError("");
    const err = onSubmit({
      name,
      organizer: organizer.trim() || "Not stated",
      category: category as Competition["category"],
      subcategory: sub.trim() || category,
      link,
      registration_deadline: deadline ? new Date(`${deadline}T23:59:00`).toISOString() : "",
      min_team_size: min,
      max_team_size: max,
      requirements: rules.trim(),
      rewards,
      poster,
    });
    if (err) setError(err);
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Competition name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robotics Open Cup" className={inputCls} />
      </Field>
      <Field label="Organizer (optional)">
        <input value={organizer} onChange={(e) => setOrganizer(e.target.value)} className={inputCls} />
      </Field>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Category</span>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={`h-9 px-3.5 rounded-[10px] text-[13px] ${category === c ? "bg-lime" : "bg-card"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <Field label="Type (optional)">
        <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="e.g. Hackathon, Case study" className={inputCls} />
      </Field>
      <Field label="Official link" hint="Teams will open this to register.">
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" className={inputCls} />
      </Field>
      <Field label="Registration deadline">
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min team size">
          <input type="number" min={1} max={10} value={min} onChange={(e) => setMin(Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Max team size">
          <input type="number" min={1} max={10} value={max} onChange={(e) => setMax(Number(e.target.value))} className={inputCls} />
        </Field>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Rewards (optional)</span>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReward();
              }
            }}
            placeholder="e.g. Prize pool Rp5 jt"
            className={inputCls}
          />
          <button type="button" onClick={addReward} className="h-[52px] px-4 rounded-2xl bg-ink text-white font-semibold text-sm shrink-0">
            Add
          </button>
        </div>
        {rewards.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {rewards.map((r) => (
              <span key={r} className="bg-sand rounded-lg pl-2.5 pr-1.5 py-1 text-xs flex items-center gap-1.5">
                {r}
                <button type="button" aria-label={`Remove ${r}`} onClick={() => setRewards(rewards.filter((x) => x !== r))}>
                  <IconClose size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Field label="Rules (optional)">
        <textarea value={rules} maxLength={300} onChange={(e) => setRules(e.target.value)} className="h-24 resize-none rounded-2xl bg-card p-3.5 text-[15px] leading-normal outline-none focus:ring-2 focus:ring-ink" />
      </Field>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Poster (optional)</span>
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="Poster preview" className="w-full max-h-72 object-contain rounded-2xl bg-card" />
        )}
        <input type="file" accept="image/*" onChange={(e) => readPoster(e.target.files?.[0])} className="text-sm" aria-label="Upload poster" />
      </div>
      {error && (
        <p role="alert" className="m-0 text-sm font-semibold bg-lime rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <PrimaryArrowButton onClick={submit}>{submitLabel}</PrimaryArrowButton>
    </div>
  );
}
