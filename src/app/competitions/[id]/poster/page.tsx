"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { isPast, useStore } from "@/lib/store";
import { BackButton, Gone } from "@/components/ui";

export default function Poster() {
  const { id } = useParams<{ id: string }>();
  const { db } = useStore();
  const c = db.competitions.find((x) => x.id === id);
  if (!c) return <Gone title="This competition was removed" body="It is no longer listed." href="/competitions" label="Back to competitions" />;
  if (isPast(c.registration_deadline)) return <Gone title="This competition has closed" body="Registration is over, so it is no longer listed." href="/competitions" label="Back to competitions" />;
  return (
    <main className="min-h-dvh px-5 pt-7 pb-10 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="m-0 text-xl font-bold truncate">{c.name}</h1>
      </div>
      {c.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.poster} alt={`${c.name} poster`} className="w-full h-auto rounded-2xl" />
      ) : (
        <div className="bg-card rounded-[22px] p-6 text-center text-sm text-muted">No poster for this competition yet.</div>
      )}
      <Link href={`/competitions/${c.id}`} className="h-14 rounded-[18px] bg-ink text-white no-underline flex items-center justify-center font-semibold">
        Back to competition
      </Link>
    </main>
  );
}
