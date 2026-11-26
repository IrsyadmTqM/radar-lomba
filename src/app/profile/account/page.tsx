"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { MAX } from "@/lib/types";
import { cleanHandle, isValidInstagram, isValidLinkedin, isValidWhatsapp } from "@/lib/contacts";
import { BackButton, ConfirmModal, Field, FormAlert, PasswordInput, PrimaryArrowButton, inputCls, useFormError, useSubmitState } from "@/components/ui";

export default function Account() {
  const { me, updateProfile, deleteAccount, showToast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState(me?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(me?.whatsapp ?? "");
  const [instagram, setInstagram] = useState(me?.instagram ?? "");
  const [linkedin, setLinkedin] = useState(me?.linkedin ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [current, setCurrent] = useState("");
  const [del, setDel] = useState(false);
  const { error, nonce, setError, clear, invalid } = useFormError();
  const submit = useSubmitState();
  if (!me) return null;

  const changed = {
    email: email.trim() !== (me.email ?? ""),
    whatsapp: whatsapp.trim() !== (me.whatsapp ?? ""),
    instagram: cleanHandle(instagram) !== (me.instagram ?? ""),
    linkedin: linkedin.trim() !== (me.linkedin ?? ""),
    password: pw !== "" || pw2 !== "",
  };
  const dirty = Object.values(changed).some(Boolean);

  async function save() {
    if (!dirty) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email.", "email");
    if (!whatsapp.trim()) return setError("WhatsApp is required. Teammates use it to reach you.", "whatsapp");
    if (!isValidWhatsapp(whatsapp)) return setError("Use a WhatsApp number like 0812xxxx or +62812xxxx.", "whatsapp");
    if (!isValidInstagram(instagram)) return setError("Instagram handle can only use letters, numbers, dots and underscores.", "instagram");
    if (!isValidLinkedin(linkedin)) return setError("Paste your LinkedIn profile link or username.", "linkedin");
    if (changed.password) {
      if (pw.length < 6) return setError("New password needs at least 6 characters.", "pw");
      if (pw !== pw2) return setError("New passwords don't match.", "pw2");
    }
    if (!current) return setError("Enter your current password to confirm these changes.", "current");
    // Demo: accounts created before passwords were stored accept any 6+ characters once.
    if (me!.password ? current !== me!.password : current.length < 6) return setError("Current password is wrong.", "current");
    clear();
    const ok = await submit.run(() =>
      updateProfile({
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() ? cleanHandle(instagram) : undefined,
        linkedin: linkedin.trim() || undefined,
        password: changed.password ? pw : (me!.password ?? current),
      }),
    );
    if (ok) {
      showToast("Account updated");
      router.push("/profile");
    }
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center gap-3">
        <BackButton href="/profile" />
        <h1 className="m-0 text-[22px] font-bold">Account settings</h1>
      </div>

      <Section title="Email">
        <Field label="Email">
          <input type="email" name="email" maxLength={MAX.email} aria-invalid={invalid("email")} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} />
        </Field>
      </Section>

      <Section title="Contacts" hint="Only your teammates see these.">
        <Field label="WhatsApp number">
          <input name="whatsapp" type="tel" inputMode="tel" maxLength={MAX.whatsapp} aria-invalid={invalid("whatsapp")} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 081234567890" className={inputCls} />
        </Field>
        <Field label="Instagram (optional)">
          <input name="instagram" maxLength={MAX.instagram} aria-invalid={invalid("instagram")} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="e.g. @yourhandle" className={inputCls} />
        </Field>
        <Field label="LinkedIn (optional)">
          <input name="linkedin" maxLength={MAX.linkedin} aria-invalid={invalid("linkedin")} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname or username" className={inputCls} />
        </Field>
      </Section>

      <Section title="Change password" hint="Leave empty to keep your current password.">
        <Field label="New password">
          <PasswordInput name="pw" invalid={!!invalid("pw")} value={pw} onChange={setPw} autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput name="pw2" invalid={!!invalid("pw2")} value={pw2} onChange={setPw2} autoComplete="new-password" />
        </Field>
      </Section>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${dirty ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 -mb-5"}`}
        aria-hidden={!dirty}
      >
        <div className="overflow-hidden">
          <div className="bg-lime rounded-[20px] p-4 flex flex-col gap-2">
            <Field label="Current password" hint="Needed to save changes to your email, contacts or password.">
              <PasswordInput name="current" invalid={!!invalid("current")} value={current} onChange={setCurrent} />
            </Field>
          </div>
        </div>
      </div>

      <FormAlert message={error} nonce={nonce} />
      <div className="flex flex-col gap-2">
        <PrimaryArrowButton onClick={save} disabled={!dirty} state={submit.state} doneLabel="Saved">
          Save changes
        </PrimaryArrowButton>
        {!dirty && <span className="text-center text-xs text-muted">Change something above to save.</span>}
      </div>

      <button type="button" onClick={() => setDel(true)} className="h-12 rounded-2xl border-[1.5px] border-sand font-semibold text-sm">
        Delete account
      </button>
      {del && (
        <ConfirmModal
          title="Delete your account?"
          body="Your profile, team memberships and invitations are removed from this browser. Teams you were alone in are deleted too. This can't be undone."
          confirmLabel="Delete"
          danger
          onCancel={() => setDel(false)}
          onConfirm={() => {
            deleteAccount();
            router.push("/");
          }}
        />
      )}
    </main>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-base font-bold">{title}</h2>
        {hint && <span className="text-xs text-muted text-right">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
