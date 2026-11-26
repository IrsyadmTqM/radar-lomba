"use client";

import Link from "next/link";
import { daysLeft, useStore } from "@/lib/store";
import { BackButton, initialsOf } from "@/components/ui";
import { IconBookmark } from "@/components/Icons";

export default function Saved() {
  const { db, now } = useStore();
  const list = db.competitions.filter((c) => db.saved.includes(c.id) && !c.hidden);
  return (
    <main className="min-h-dvh px-5 pt-14 pb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton href="/competitions" />
        <h1 className="m-0 text-[22px] font-bold">Saved competitions</h1>
      </div>
      {list.length === 0 && (
        <div className="bg-card rounded-[22px] p-6 text-center flex flex-col items-center gap-2">
          <IconBookmark size={28} />
          <span className="font-semibold">Nothing saved yet</span>
          <span className="text-sm text-muted">Tap the bookmark on a competition to keep it here.</span>
          <Link href="/competitions" className="mt-2 h-11 px-5 rounded-[14px] bg-ink text-white no-underline flex items-center font-semibold text-sm">
            Browse competitions
          </Link>
        </div>
      )}
      {list.map((c) => {
        const left = daysLeft(c.registration_deadline, now);
        return (
          <Link key={c.id} href={`/competitions/${c.id}`} className="no-underline text-ink bg-card rounded-[20px] p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-sand flex items-center justify-center font-bold shrink-0">{initialsOf(c.name)}</div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-[15px] truncate">{c.name}</span>
              <span className="text-xs text-muted">{c.category}</span>
            </div>
            <span className="text-xs bg-paper rounded-lg px-2 py-1.5 shrink-0">{left < 0 ? "closed" : `${left} d`}</span>
          </Link>
        );
      })}
    </main>
  );
}
