"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { daysLeft, useStore } from "@/lib/store";
import { IconArrow, IconChat } from "@/components/Icons";

export default function TeamReady() {
  const { requestId } = useParams<{ requestId: string }>();
  const { db, now } = useStore();
  const r = db.requests.find((x) => x.id === requestId);
  const c = r && db.competitions.find((x) => x.id === r.competition_id);
  if (!r || !c) return null;
  const count = db.members.filter((m) => m.request_id === r.id).length;
  const left = daysLeft(c.registration_deadline, now);

  return (
    <main className="min-h-dvh px-6 pt-[72px] pb-9 flex flex-col justify-between gap-8">
      <div className="flex flex-col items-center gap-[18px] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illustrations/team-ready.svg" alt="Three teammates celebrating under a check mark" className="w-[320px] max-w-full h-auto" />
        <span className="bg-lime rounded-[10px] px-3 py-1.5 font-bold text-[13px]">
          {r.title} · {count}/{c.max_team_size}
        </span>
        <h1 className="m-0 text-[32px] leading-[1.1] font-extrabold">Your team is ready</h1>
        <p className="m-0 text-[15px] leading-normal text-muted">
          Everyone accepted. Join the team WhatsApp group and register before the deadline in {left} day{left === 1 ? "" : "s"}.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <Link href={`/teams/${r.id}`} className="h-14 rounded-[18px] bg-ink text-white no-underline flex items-center justify-between pl-[22px] pr-2 font-bold text-base">
          Open team page
          <span className="w-[42px] h-[42px] rounded-[14px] bg-lime flex items-center justify-center">
            <IconArrow color="#1E1E1E" />
          </span>
        </Link>
        {r.group_link ? (
          <a href={r.group_link} target="_blank" rel="noreferrer" className="h-[52px] rounded-[18px] bg-card text-ink no-underline flex items-center justify-center gap-2 font-bold text-[15px]">
            <IconChat size={18} /> Join team WhatsApp
          </a>
        ) : (
          <span className="text-center text-[13px] text-muted">The owner can add the team WhatsApp link on the team page.</span>
        )}
      </div>
    </main>
  );
}
