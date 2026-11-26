"use client";

import { useRef, useState } from "react";
import { CATEGORIES, MAX, type Competition } from "@/lib/types";
import type { NewCompetition } from "@/lib/store";
import { Field, FormAlert, PrimaryArrowButton, inputCls, textareaCls, useDirty, useFormError } from "@/components/ui";
import { IconClose, IconPlus, IconTrophy } from "@/components/Icons";

/** Shared form for adding or editing a competition (students and admins). */
export function CompetitionForm({ initial, submitLabel, onSubmit }: { initial?: Competition; submitLabel: string; onSubmit: (c: NewCompetition) => string | null }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [organizer, setOrganizer] = useState(initial?.organizer === "Not stated" ? "" : (initial?.organizer ?? ""));
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
  const fileRef = useRef<HTMLInputElement>(null);
  const { error, nonce, setError, clear } = useFormError();

  const values = { name, organizer, category, sub, link, deadline, min, max, rules, rewards, poster };
  const changed = useDirty(values, values);
  // Editing: only allow saving when something actually changed.
  const canSave = !initial || changed;

  const addReward = () => {
    const t = draft.trim();
    if (t && !rewards.includes(t)) setRewards([...rewards, t]);
    setDraft("");
  };

  function readPoster(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Pick an image file for the poster.");
    if (f.size > 1_500_000) return setError("Poster is too large. Use an image under 1.5 MB.");
    clear();
    const r = new FileReader();
    r.onload = () => setPoster(String(r.result));
    r.readAsDataURL(f);
  }

  function submit() {
    if (!canSave) return;
    const err = onSubmit({
      name,
      organizer: organizer.trim() || "Not stated",
      category: category as Competition["category"],
      subcategory: sub.trim() || category,
      link: link.trim(),
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
    <div className="flex flex-col gap-4" onInput={clear}>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">
          Poster <span className="font-medium text-muted">(optional)</span>
        </span>
        {poster ? (
          <div className="relative animate-rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="Poster preview" className="w-full max-h-72 object-contain rounded-2xl bg-card" />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button type="button" onClick={() => fileRef.current?.click()} className="h-9 px-3 rounded-xl bg-ink text-white text-xs font-semibold">
                Change
              </button>
              <button type="button" aria-label="Remove poster" onClick={() => setPoster(undefined)} className="w-9 h-9 rounded-xl bg-card text-ink flex items-center justify-center">
                <IconClose size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-32 rounded-2xl border-[1.5px] border-dashed border-olive bg-card/60 flex flex-col items-center justify-center gap-1.5 text-muted hover:border-ink hover:text-ink"
          >
            <IconPlus size={22} />
            <span className="text-sm font-semibold">Upload poster</span>
            <span className="text-xs">Image, under 1.5 MB</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => readPoster(e.target.files?.[0])} className="hidden" aria-label="Upload poster" />
      </div>

      <Field label="Competition name">
        <input value={name} maxLength={MAX.compName} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robotics Open Cup" className={inputCls} />
      </Field>
      <Field label="Organizer (optional)">
        <input value={organizer} maxLength={MAX.organizer} onChange={(e) => setOrganizer(e.target.value)} className={inputCls} />
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
        <input value={sub} maxLength={MAX.compType} onChange={(e) => setSub(e.target.value)} placeholder="e.g. Hackathon, Case study" className={inputCls} />
      </Field>
      <Field label="Official link" hint="Teams will open this to register.">
        <input value={link} maxLength={MAX.link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" className={inputCls} />
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
        <span className="text-[13px] font-semibold flex items-center gap-2 flex-wrap">
          Rewards <span className="font-medium text-muted">(optional)</span>
          <span className="bg-sand rounded-md px-1.5 py-0.5 text-[11px] font-semibold">Add more than one</span>
        </span>
        <div className="flex gap-2">
          <input
            value={draft}
            maxLength={MAX.reward}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReward();
              }
            }}
            placeholder="e.g. Prize pool Rp5 jt, Certificate"
            className={inputCls}
          />
          <button type="button" onClick={addReward} disabled={!draft.trim()} className="h-[52px] px-4 rounded-2xl bg-ink text-white font-semibold text-sm shrink-0">
            Add
          </button>
        </div>
        {rewards.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {rewards.map((r) => (
              <span key={r} className="animate-pop bg-ink text-lime rounded-[10px] pl-2 pr-1 py-1 text-xs font-semibold flex items-center gap-1">
                <IconTrophy size={12} strokeWidth={2.4} />
                {r}
                <button type="button" aria-label={`Remove ${r}`} onClick={() => setRewards(rewards.filter((x) => x !== r))} className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/15">
                  <IconClose size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Field label="Rules (optional)">
        <textarea value={rules} maxLength={MAX.rules} onChange={(e) => setRules(e.target.value)} className={textareaCls} />
      </Field>
      <FormAlert message={error} nonce={nonce} />
      <div className="flex flex-col gap-2">
        <PrimaryArrowButton onClick={submit} disabled={!canSave}>
          {submitLabel}
        </PrimaryArrowButton>
        {!canSave && <span className="text-center text-xs text-muted">Change something above to save.</span>}
      </div>
    </div>
  );
}
