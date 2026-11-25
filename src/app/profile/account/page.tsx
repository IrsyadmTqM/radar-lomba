"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BackButton, ConfirmModal, Field, PrimaryArrowButton, inputCls } from "@/components/ui";

export default function Account() {
  const { me, updateProfile, deleteAccount, showToast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState(me?.email ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [del, setDel] = useState(false);
  const [error, setError] = useState("");
  if (!me) return null;

  function save() {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email.");
    if (pw && pw.length < 6) return setError("Password needs at least 6 characters.");
    if (pw !== pw2) return setError("Passwords don't match.");
    updateProfile({ email: email.trim() });
    showToast(pw ? "Email and password updated (demo)" : "Email updated");
    router.push("/profile");
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href="/profile" />
        <h1 className="m-0 text-[22px] font-bold">Account settings</h1>
      </div>
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </Field>
      <Field label="New password" hint="Leave empty to keep your current password.">
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" className={inputCls} />
      </Field>
      <Field label="Confirm new password">
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" className={inputCls} />
      </Field>
      {error && (
        <p role="alert" className="m-0 text-sm font-semibold bg-lime rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <PrimaryArrowButton onClick={save}>Save changes</PrimaryArrowButton>
      <button type="button" onClick={() => setDel(true)} className="h-12 rounded-2xl border-[1.5px] border-sand font-semibold text-sm">
        Delete account
      </button>
      {del && (
        <ConfirmModal
          title="Delete your account?"
          body="Your profile, team memberships and invitations are removed from this browser. This can't be undone."
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
