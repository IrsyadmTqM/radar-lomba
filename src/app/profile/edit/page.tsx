"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { MAX } from "@/lib/types";
import { Avatar, BackButton, Field, FormAlert, PrimaryArrowButton, inputCls, useDirty, useFormError, useSubmitState } from "@/components/ui";

export default function EditProfile() {
  const { me, updateProfile, showToast } = useStore();
  const router = useRouter();
  const [avatar, setAvatar] = useState(me?.avatar_id ?? 1);
  const [name, setName] = useState(me?.full_name ?? "");
  const [campus, setCampus] = useState(me?.campus ?? "");
  const [major, setMajor] = useState(me?.major ?? "");
  const { error, nonce, setError, clear, invalid } = useFormError();
  const submit = useSubmitState();
  const dirty = useDirty({ avatar, name: name.trim(), campus: campus.trim(), major: major.trim() }, { avatar: me?.avatar_id, name: me?.full_name, campus: me?.campus, major: me?.major });
  if (!me) return null;

  async function save() {
    if (name.trim().length < 2) return setError("Add your name.", "name");
    if (!campus.trim()) return setError("Add your campus.", "campus");
    if (!major.trim()) return setError("Add your major.", "major");
    clear();
    if (await submit.run(() => updateProfile({ avatar_id: avatar, full_name: name.trim(), campus: campus.trim(), major: major.trim() }))) {
      showToast("Profile updated");
      router.push("/profile");
    }
  }

  return (
    <main className="min-h-dvh px-5 pt-7 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center gap-3">
        <BackButton href="/profile" />
        <h1 className="m-0 text-[22px] font-bold">Edit profile</h1>
      </div>
      <div className="self-center">
        <Avatar key={avatar} id={avatar} size={112} radius={36} alt="Selected avatar" className="animate-pop" />
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
          <button key={id} type="button" aria-label={`Avatar ${id}`} aria-pressed={id === avatar} onClick={() => setAvatar(id)} className={`aspect-square rounded-[20px] overflow-hidden border-[3px] ${id === avatar ? "border-ink" : "border-transparent hover:border-sand"}`}>
            <Avatar id={id} size={80} radius={12} className="!w-full !h-full" />
          </button>
        ))}
      </div>
      <Field label="Full name">
        <input name="name" aria-invalid={invalid("name")} maxLength={MAX.name} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Campus">
        <input name="campus" aria-invalid={invalid("campus")} maxLength={MAX.campus} value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="e.g. UIN Sunan Gunung Djati Bandung" className={inputCls} />
      </Field>
      <Field label="Major">
        <input name="major" aria-invalid={invalid("major")} maxLength={MAX.major} value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Informatics" className={inputCls} />
      </Field>
      <FormAlert message={error} nonce={nonce} />
      <div className="mt-auto flex flex-col gap-2">
        <PrimaryArrowButton onClick={save} disabled={!dirty} state={submit.state} doneLabel="Saved">
          Save changes
        </PrimaryArrowButton>
        {!dirty && <span className="text-center text-xs text-muted">Change something above to save.</span>}
      </div>
    </main>
  );
}
