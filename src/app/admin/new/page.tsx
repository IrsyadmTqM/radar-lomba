"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { BackButton } from "@/components/ui";
import { CompetitionForm } from "@/components/CompetitionForm";

export default function AdminNew() {
  const router = useRouter();
  const { addCompetition, showToast } = useStore();
  return (
    <main className="min-h-dvh px-5 pt-14 pb-10 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href="/admin" />
        <h1 className="m-0 text-[22px] font-bold">Add a competition</h1>
      </div>
      <CompetitionForm
        submitLabel="Add competition"
        onSubmit={(c) => {
          const r = addCompetition(c);
          if (!r.ok) return r.error;
          showToast("Competition added");
          router.replace("/admin");
          return null;
        }}
      />
    </main>
  );
}
