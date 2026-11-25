"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BackButton, Field, PrimaryArrowButton, inputCls } from "@/components/ui";
import { IconInfo } from "@/components/Icons";

export default function Login() {
  const { createProfile, signInAdmin, showToast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Frontend-only build: sign-in opens a ready-made demo account.
    createProfile({
      full_name: "Asep A.",
      avatar_id: 9,
      major: "Informatics",
      faculty: "Science and Technology",
      entry_year: 2023,
      skills: ["Software dev", "Design"],
      email: email.trim(),
      bio: "React, Tailwind and Figma.",
      commitment_hours_per_week: 10,
      commitment_goal: "finalist",
      contact: "@asep.a",
      data_consent: true,
    });
    showToast("Signed in to the demo account");
    router.push("/competitions");
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-6">
      <BackButton href="/" />
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[28px] font-extrabold">Welcome back</h1>
        <p className="m-0 text-[15px] text-muted">Sign in with your campus email.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 flex-1">
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.uinsgd.ac.id" className={inputCls} />
        </Field>
        <Field label="Password">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        <div className="bg-card rounded-2xl p-3.5 flex gap-2.5 items-start">
          <IconInfo size={18} className="shrink-0 mt-px" />
          <span className="text-[13px] leading-[1.45] text-muted">Preview build: any email and password open a demo account. Real sign-in comes with the Supabase backend.</span>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <Link href="/forgot-password" className="text-center text-sm underline">Forgot password?</Link>
          <PrimaryArrowButton type="submit">Sign in</PrimaryArrowButton>
          <button
            type="button"
            onClick={() => {
              signInAdmin();
              showToast("Signed in as admin");
              router.push("/admin");
            }}
            className="text-center text-sm underline"
          >
            Demo: open admin view
          </button>
        </div>
      </form>
    </main>
  );
}
