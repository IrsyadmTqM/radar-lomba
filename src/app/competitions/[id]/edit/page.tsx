"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BackButton, ConfirmModal } from "@/components/ui";
import { CompetitionForm } from "@/components/CompetitionForm";

export default function EditCompetition() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { db, me, updateCompetition, removeCompetition, showToast } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const c = db.competitions.find((x) => x.id === id);
  if (!c || !me || c.added_by !== me.id) return null;
  const hasTeams = db.requests.some((r) => r.competition_id === c.id);

  return (
    <main className="min-h-dvh px-5 pt-7 pb-10 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href={`/competitions/${c.id}`} />
        <h1 className="m-0 text-[22px] font-bold">Edit competition</h1>
      </div>
      <CompetitionForm
        initial={c}
        submitLabel="Save changes"
        onSubmit={(v) => {
          const r = updateCompetition(c.id, v);
          if (!r.ok) return r.error;
          showToast("Saved");
          router.replace(`/competitions/${c.id}`);
          return null;
        }}
      />
      <button type="button" onClick={() => setConfirmDel(true)} className="h-12 rounded-2xl border-[1.5px] border-sand font-semibold text-sm">
        Delete competition
      </button>
      {confirmDel && (
        <ConfirmModal
          title="Delete this competition?"
          body={hasTeams ? "Teams already exist for it, so it can't be deleted." : "It will disappear from the list for everyone."}
          confirmLabel={hasTeams ? "OK" : "Delete"}
          danger
          onCancel={() => setConfirmDel(false)}
          onConfirm={() => {
            if (!hasTeams) {
              removeCompetition(c.id);
              showToast("Competition deleted");
              router.replace("/competitions");
            } else setConfirmDel(false);
          }}
        />
      )}
    </main>
  );
}
