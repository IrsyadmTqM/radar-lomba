"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { DEFAULT_CAMPUS, GOAL_OPTIONS, SKILLS, type Goal } from "@/lib/types";
import { Avatar, Field, PrimaryArrowButton, TogglePill, avatarSrc, inputCls } from "@/components/ui";
import { IconBack, IconCheck } from "@/components/Icons";

export default function Onboarding() {
  const router = useRouter();
  const { createProfile, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState(2);
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [campus, setCampus] = useState(DEFAULT_CAMPUS);
  const [year, setYear] = useState(2023);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [hours, setHours] = useState(8);
  const [goal, setGoal] = useState<Goal>("finalist");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);

  function next() {
    setError("");
    if (step === 1) {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email.");
      if (password.length < 6) return setError("Password needs at least 6 characters.");
      if (password !== confirm) return setError("Passwords don't match.");
    }
    if (step === 2 && name.trim().length < 2) return setError("Tell us your name.");
    if (step === 3) {
      if (!major.trim()) return setError("Add your major.");
      if (!skills.length) return setError("Pick at least one role.");
    }
    if (step === 4) {
      if (!contact.trim()) return setError("Add a WhatsApp number or Instagram handle. Only teammates see it.");
      if (!consent) return setError("Tick the consent box so teams can find you.");
      createProfile({
        full_name: name.trim(),
        avatar_id: avatar,
        major: major.trim(),
        campus,
        entry_year: year,
        skills,
        bio: bio.trim(),
        commitment_hours_per_week: hours,
        commitment_goal: goal,
        contact: contact.trim(),
        data_consent: consent,
        email: email.trim(),
      });
      showToast("Profile created");
      router.push("/competitions");
      return;
    }
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  const toggleSkill = (s: string) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (step === 1 ? router.push("/") : setStep(step - 1))}
          className="w-11 h-11 rounded-[14px] bg-card flex items-center justify-center"
        >
          <IconBack />
        </button>
        <span className="text-[13px] text-muted">Step {step} of 4</span>
      </div>

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">Create your account</h1>
            <p className="m-0 text-[15px] leading-normal text-muted">Use your campus email. Preview build: email confirmation is skipped.</p>
          </div>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.uinsgd.ac.id" autoComplete="email" className={inputCls} />
          </Field>
          <Field label="Password" hint="At least 6 characters.">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label="Confirm password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} />
          </Field>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">Pick your avatar</h1>
            <p className="m-0 text-[15px] leading-normal text-muted">No photo upload needed. Choose one that feels like you, you can change it later.</p>
          </div>
          <div className="self-center w-[132px] h-[132px] rounded-[40px] overflow-hidden shadow-[0_0_0_6px_#CEEC68]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc(avatar)} alt="Selected avatar" className="w-full h-full block" />
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => {
              const on = id === avatar;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Avatar ${id}${on ? ", selected" : ""}`}
                  aria-pressed={on}
                  onClick={() => setAvatar(id)}
                  className={`relative aspect-square p-0 rounded-[20px] overflow-hidden border-[3px] ${on ? "border-ink" : "border-transparent"}`}
                >
                  <Avatar id={id} size={100} radius={on ? 0 : 16} className="!w-full !h-full" />
                  {on && (
                    <span className="absolute right-[3px] bottom-[3px] w-5 h-5 rounded-[7px] bg-ink flex items-center justify-center">
                      <IconCheck size={12} color="#CEEC68" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nadia Salsabila" autoComplete="name" className={inputCls} />
          </Field>
        </>
      )}

      {step === 3 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">Which roles can you cover?</h1>
            <p className="m-0 text-[15px] leading-normal text-muted">Teams search by these roles, whatever your major. Pick all that apply.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">
              Roles <span className="font-medium text-muted">(pick one or more)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <TogglePill key={s} on={skills.includes(s)} onClick={() => toggleSkill(s)}>
                  {s}
                </TogglePill>
              ))}
            </div>
          </div>
          <Field label="Major">
            <input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Informatics" className={inputCls} />
          </Field>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Campus">
              <input value={campus} onChange={(e) => setCampus(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Entry year">
              <input type="number" min={2018} max={2026} value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Short bio" hint={`${bio.length}/160`}>
            <textarea value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} placeholder="Tools you use, projects you built." className="h-24 resize-none rounded-2xl bg-card p-3.5 text-[15px] leading-normal outline-none focus:ring-2 focus:ring-ink" />
          </Field>
        </>
      )}

      {step === 4 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">How much can you give?</h1>
            <p className="m-0 text-[15px] leading-normal text-muted">Be honest, this is what keeps teams from falling apart halfway.</p>
          </div>
          <div className="bg-card rounded-[20px] p-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">Hours per week, across all competitions</span>
              <span className="text-2xl font-bold">{hours} h</span>
            </div>
            <input type="range" min={2} max={20} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-[#1E1E1E]" aria-label="Hours per week" />
            <span className="text-xs text-muted">You can join several competitions, one team each. Every team you join uses part of these hours.</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Your goal</span>
            {GOAL_OPTIONS.map((g) => {
              const on = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGoal(g.value)}
                  className={`text-left rounded-[18px] p-3.5 flex items-center gap-3 ${on ? "bg-ink text-white" : "bg-card"}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${on ? "bg-lime" : "bg-sand"}`}>{on && <IconCheck size={14} color="#1E1E1E" />}</span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-[15px]">{g.title}</span>
                    <span className={`text-xs ${on ? "text-mist" : "text-muted"}`}>{g.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Field label="Contact (WhatsApp or Instagram)" hint="Hidden until you join a team.">
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@yourhandle or 08xx" className={inputCls} />
          </Field>
          <label className="flex gap-3 items-start bg-card rounded-2xl p-3.5">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#1E1E1E] shrink-0" />
            <span className="text-[13px] leading-[1.45] text-muted">I agree that my name, major, skills, hours and goal are shown to students looking for teammates. My contact is only shown to my teammates.</span>
          </label>
        </>
      )}

      {error && <p role="alert" className="m-0 text-sm font-semibold text-ink bg-lime rounded-xl px-3 py-2">{error}</p>}

      <div className="mt-auto pt-2">
        <PrimaryArrowButton onClick={next}>{step === 4 ? "Finish" : "Continue"}</PrimaryArrowButton>
      </div>
    </main>
  );
}
