"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { IconArrow } from "@/components/Icons";

export default function Welcome() {
  const { me } = useStore();
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="relative h-[min(480px,57dvh)] min-h-[400px] bg-lime rounded-b-[36px] overflow-hidden">
        <svg viewBox="0 0 390 480" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#1E1E1E" strokeWidth="2.5" aria-hidden="true" className="absolute inset-0 w-full h-full">
          <circle cx="195" cy="270" r="150" strokeOpacity="0.14" />
          <circle cx="195" cy="270" r="200" strokeOpacity="0.09" />
          <circle cx="195" cy="270" r="250" strokeOpacity="0.06" />
        </svg>
        <div className="relative h-full flex flex-col items-center pt-[50px] gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/radar-lomba-icon-on-lime.png" alt="Radar Lomba logo" className="w-[55px] h-[52px]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/welcome-team.png" alt="Four students fitting trophy puzzle pieces together into one team" className="w-[320px] max-w-[82%] h-auto mt-3" />
        </div>
      </div>

      <div className="flex-1 px-6 pt-[26px] pb-9 flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="m-0 text-[32px] leading-[1.1] font-bold">Stop competing with only your friend circle.</h1>
          <p className="m-0 text-[15px] leading-normal text-muted">Find teammates for a specific competition, matched on the skills you need and how much time they can give.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href={me ? (me.role === "admin" ? "/admin" : "/competitions") : "/onboarding"} className="h-14 rounded-[18px] bg-ink text-white no-underline flex items-center justify-between pl-[22px] pr-2 font-semibold text-base">
            {me ? (me.role === "admin" ? "Open admin" : `Continue as ${me.full_name.split(" ")[0]}`) : "Create my profile"}
            <span className="w-[42px] h-[42px] rounded-[14px] bg-lime flex items-center justify-center">
              <IconArrow color="#1E1E1E" />
            </span>
          </Link>
          {!me && (
            <Link href="/login" className="text-center text-sm text-ink underline">
              I already have an account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
