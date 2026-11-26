"use client";

import Link from "next/link";
import { daysLeft, useStore } from "@/lib/store";
import { BackButton, InfoTag, StudentLabel } from "@/components/ui";
import { IconBookmark, IconTrash } from "@/components/Icons";

export default function Saved() {
  const { db, now, toggleSaved, showToast } = useStore();
  const list = db.competitions.filter((c) => db.saved.includes(c.id) && !c.hidden);
  return (
    <main className="min-h-dvh px-5 pt-14 pb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton href="/competitions" />
        <h1 className="m-0 text-[22px] font-bold">Saved competitions</h1>
      </div>
      {list.length === 0 && (
        <div className="animate-rise bg-card rounded-[22px] p-6 text-center flex flex-col items-center gap-2">
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
          <div key={c.id} className="animate-rise bg-card rounded-[20px] flex items-center pr-2">
            <Link href={`/competitions/${c.id}`} className="flex-1 min-w-0 no-underline text-ink p-3.5 flex items-center gap-3 rounded-[20px]">
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <span className="font-semibold text-[15px] truncate">{c.name}</span>
                <div className="flex gap-1.5 flex-wrap items-center">
                  <InfoTag>{c.category}</InfoTag>
                  {c.student_added && <StudentLabel />}
                </div>
              </div>
              <span className="text-xs bg-paper rounded-lg px-2 py-1.5 shrink-0">{left < 0 ? "closed" : `${left} d`}</span>
            </Link>
            <button
              type="button"
              aria-label={`Remove ${c.name} from saved`}
              onClick={() => {
                toggleSaved(c.id);
                showToast("Removed from saved");
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-danger hover:bg-danger-soft shrink-0"
            >
              <IconTrash size={18} />
            </button>
          </div>
        );
      })}
    </main>
  );
}
