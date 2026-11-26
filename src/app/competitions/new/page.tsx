"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { BackButton } from "@/components/ui";
import { CompetitionForm } from "@/components/CompetitionForm";

export default function NewCompetition() {
  const router = useRouter();
  const { addCompetition, showToast } = useStore();
  return (
    <main className="min-h-dvh px-5 pt-14 pb-10 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href="/competitions" />
        <div className="flex flex-col">
          <span className="text-xs text-muted">Not in the list yet?</span>
          <h1 className="m-0 text-[22px] font-bold">Add a competition</h1>
        </div>
      </div>
      <p className="m-0 text-sm text-muted leading-normal">It shows as &ldquo;Added by a student&rdquo;. A campus admin can hide it if it&apos;s a duplicate or wrong.</p>
      <CompetitionForm
        submitLabel="Add competition"
        onSubmit={(c) => {
          const r = addCompetition(c);
          if (!r.ok) return r.error;
          showToast("Competition added");
          router.replace(`/competitions/${r.id}`);
          return null;
        }}
      />
    </main>
  );
}
