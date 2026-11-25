"use client";

import Link from "next/link";
import { useState } from "react";
import { BackButton, Field, PrimaryArrowButton, inputCls } from "@/components/ui";
import { IconCheck, IconInfo } from "@/components/Icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-6">
      <BackButton href="/login" />
      {!sent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="flex flex-col gap-4 flex-1"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[28px] font-extrabold">Forgot password?</h1>
            <p className="m-0 text-[15px] text-muted leading-normal">Enter your email and we&apos;ll send a link to set a new password.</p>
          </div>
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.uinsgd.ac.id" className={inputCls} />
          </Field>
          <div className="bg-card rounded-2xl p-3.5 flex gap-2.5 items-start">
            <IconInfo size={18} className="shrink-0 mt-px" />
            <span className="text-[13px] leading-[1.45] text-muted">Preview build: no email is sent. Real password reset comes with the Supabase backend.</span>
          </div>
          <div className="mt-auto">
            <PrimaryArrowButton type="submit">Send reset link</PrimaryArrowButton>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4 flex-1 items-center text-center pt-10">
          <span className="w-20 h-20 rounded-[28px] bg-lime flex items-center justify-center">
            <IconCheck size={36} color="#1E1E1E" />
          </span>
          <h1 className="m-0 text-[26px] font-extrabold">Reset link sent</h1>
          <p className="m-0 text-[15px] text-muted leading-normal">If {email} has an account, a link is on its way. Preview build: nothing is actually sent.</p>
          <Link href="/login" className="mt-auto w-full h-14 rounded-[18px] bg-ink text-white no-underline flex items-center justify-center font-bold">
            Back to sign in
          </Link>
        </div>
      )}
    </main>
  );
}
