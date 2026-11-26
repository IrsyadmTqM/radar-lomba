"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { GOAL_OPTIONS, MAX, SKILLS, type Goal } from "@/lib/types";
import { cleanHandle, isValidInstagram, isValidLinkedin, isValidWhatsapp } from "@/lib/contacts";
import { Avatar, Field, FormAlert, PasswordInput, PrimaryArrowButton, TogglePill, avatarSrc, inputCls, textareaCls, useFormError, useSubmitState } from "@/components/ui";
import { IconBack, IconCheck } from "@/components/Icons";

export default function Onboarding() {
  const router = useRouter();
  const { createProfile, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"next" | "back">("next");
  const { error, nonce, setError, clear, invalid } = useFormError();
  const submit = useSubmitState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState(1);
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [campus, setCampus] = useState("");
  const [year, setYear] = useState(2023);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [hours, setHours] = useState(8);
  const [goal, setGoal] = useState<Goal>("finalist");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [consent, setConsent] = useState(false);

  function go(to: number) {
    clear();
    setDir(to > step ? "next" : "back");
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function next() {
    if (step === 1) {
      if (!email.trim()) return setError("Enter your email.", "email");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("That email doesn't look right.", "email");
      if (password.length < 6) return setError("Password needs at least 6 characters.", "password");
      if (password !== confirm) return setError("Passwords don't match.", "confirm");
    }
    if (step === 2 && name.trim().length < 2) return setError("Tell us your name.", "name");
    if (step === 3) {
      if (!skills.length) return setError("Pick at least one role.", "roles");
      if (!campus.trim()) return setError("Add your campus.", "campus");
      if (!major.trim()) return setError("Add your major.", "major");
    }
    if (step === 4) {
      if (!whatsapp.trim()) return setError("Add your WhatsApp number. Only teammates see it.", "whatsapp");
      if (!isValidWhatsapp(whatsapp)) return setError("Use a WhatsApp number like 0812xxxx or +62812xxxx.", "whatsapp");
      if (!isValidInstagram(instagram)) return setError("Instagram handle can only use letters, numbers, dots and underscores.", "instagram");
      if (!isValidLinkedin(linkedin)) return setError("Paste your LinkedIn profile link or username.", "linkedin");
      if (!consent) return setError("Tick the consent box so teams can find you.", "consent");
      clear();
      const ok = await submit.run(() => {
        createProfile({
        full_name: name.trim(),
        avatar_id: avatar,
        major: major.trim(),
        campus: campus.trim(),
        entry_year: year,
        skills,
        bio: bio.trim(),
        commitment_hours_per_week: hours,
        commitment_goal: goal,
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() ? cleanHandle(instagram) : undefined,
        linkedin: linkedin.trim() || undefined,
        password,
        data_consent: consent,
        email: email.trim(),
        });
      });
      if (ok) {
        showToast("Profile created");
        router.push("/competitions");
      }
      return;
    }
    go(step + 1);
  }

  const toggleSkill = (s: string) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (step === 1 ? router.push("/") : go(step - 1))}
          className="group w-11 h-11 rounded-[14px] bg-card flex items-center justify-center"
        >
          <IconBack className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>
        <span className="text-[13px] text-muted" aria-live="polite">
          Step {step} of 4
        </span>
      </div>
      <div className="flex gap-1.5 -mt-2" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-1 flex-1 rounded-full bg-sand overflow-hidden">
            <span className={`block h-full bg-ink rounded-full origin-left transition-transform duration-500 ease-out ${i <= step ? "scale-x-100" : "scale-x-0"}`} />
          </span>
        ))}
      </div>

      <div key={step} className={`flex flex-col gap-5 ${dir === "next" ? "animate-step-next" : "animate-step-back"}`}>

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">Create your account</h1>
            <p className="m-0 text-[15px] leading-normal text-muted">Use your campus email. Preview build: email confirmation is skipped.</p>
          </div>
          <Field label="Email">
            <input name="email" aria-invalid={invalid("email")} type="email" maxLength={MAX.email} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.uinsgd.ac.id" autoComplete="email" className={inputCls} />
          </Field>
          <Field label="Password" hint="At least 6 characters.">
            <PasswordInput name="password" invalid={!!invalid("password")} value={password} onChange={setPassword} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password">
            <PasswordInput name="confirm" invalid={!!invalid("confirm")} value={confirm} onChange={setConfirm} autoComplete="new-password" />
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
            <img key={avatar} src={avatarSrc(avatar)} alt="Selected avatar" className="w-full h-full block animate-pop" />
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
                  className={`relative aspect-square p-0 rounded-[20px] overflow-hidden border-[3px] ${on ? "border-ink" : "border-transparent hover:border-sand"}`}
                >
                  <Avatar id={id} size={100} radius={on ? 0 : 16} className="!w-full !h-full" />
                  {on && (
                    <span className="animate-pop absolute right-[3px] bottom-[3px] w-5 h-5 rounded-[7px] bg-ink flex items-center justify-center">
                      <IconCheck size={12} color="#CEEC68" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Field label="Full name">
            <input name="name" aria-invalid={invalid("name")} maxLength={MAX.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aisyah Salsabila" autoComplete="name" className={inputCls} />
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
            <div
              role="group"
              aria-label="Roles"
              aria-invalid={invalid("roles")}
              tabIndex={-1}
              data-field="roles"
              className="flex flex-wrap gap-2 rounded-2xl outline-none p-1.5 -m-1.5"
            >
              {SKILLS.map((s) => (
                <TogglePill
                  key={s}
                  on={skills.includes(s)}
                  onClick={() => {
                    toggleSkill(s);
                    clear();
                  }}
                >
                  {s}
                </TogglePill>
              ))}
            </div>
          </div>

          <Field label="Campus">
            <input name="campus" aria-invalid={invalid("campus")} value={campus} maxLength={MAX.campus} onChange={(e) => setCampus(e.target.value)} placeholder="e.g. UIN Sunan Gunung Djati Bandung" className={inputCls} />
          </Field>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Major">
            <input name="major" aria-invalid={invalid("major")} maxLength={MAX.major} value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Informatics" className={inputCls} />
          </Field>
            <Field label="Entry year">
              <input type="number" min={2018} max={2026} value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Short bio" hint={`${bio.length}/160`}>
            <textarea value={bio} maxLength={MAX.bio} onChange={(e) => setBio(e.target.value)} placeholder="Tools you use, projects you built." className={textareaCls} />
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
              <span className="text-2xl font-bold tabular-nums">{hours} h</span>
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
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${on ? "bg-lime" : "bg-sand"}`}>{on && <IconCheck size={14} color="#1E1E1E" className="animate-pop" />}</span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-[15px]">{g.title}</span>
                    <span className={`text-xs ${on ? "text-mist" : "text-muted"}`}>{g.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Field label="WhatsApp number" hint="Required. Hidden until you join a team.">
            <input name="whatsapp" aria-invalid={invalid("whatsapp")} type="tel" inputMode="tel" maxLength={MAX.whatsapp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 081234567890" autoComplete="tel" className={inputCls} />
          </Field>
          <Field label="Instagram (optional)">
            <input name="instagram" aria-invalid={invalid("instagram")} maxLength={MAX.instagram} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="e.g. @yourhandle" className={inputCls} />
          </Field>
          <Field label="LinkedIn (optional)">
            <input name="linkedin" aria-invalid={invalid("linkedin")} maxLength={MAX.linkedin} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname or username" className={inputCls} />
          </Field>
          <label className={`flex gap-3 items-start bg-card rounded-2xl p-3.5 cursor-pointer transition-shadow duration-200 ${invalid("consent") ? "shadow-[0_0_0_2px_var(--color-danger)]" : ""}`}>
            <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#1E1E1E] shrink-0" />
            <span className="text-[13px] leading-[1.45] text-muted">I agree that my name, major, skills, hours and goal are shown to students looking for teammates. My contact is only shown to my teammates.</span>
          </label>
        </>
      )}

      </div>

      <FormAlert message={error} nonce={nonce} />

      <div className="mt-auto pt-2">
        <PrimaryArrowButton onClick={next} state={submit.state} doneLabel="Profile ready">
          {step === 4 ? "Finish" : "Continue"}
        </PrimaryArrowButton>
      </div>
    </main>
  );
}
