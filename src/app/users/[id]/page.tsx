"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { freeHours, joinBlocker } from "@/lib/matching";
import { GOAL_LABEL } from "@/lib/types";
import { Avatar, BackButton, ContactList, DemoTag, Gone } from "@/components/ui";
import { contactLinks } from "@/lib/contacts";
import { PortfolioList } from "@/components/PortfolioList";

function Body() {
  const { id } = useParams<{ id: string }>();
  const team = useSearchParams().get("team");
  const { db, me, sendInvite, showToast } = useStore();
  const p = db.profiles.find((x) => x.id === id);
  const r = team ? db.requests.find((x) => x.id === team) : undefined;
  if (!me) return null;
  if (!p) return <Gone title="This account no longer exists" body="The person deleted their account." href="/competitions" label="Back to competitions" />;
  // Contacts are shared only between people on the same team.
  const myTeams = new Set(db.members.filter((m) => m.profile_id === me.id).map((m) => m.request_id));
  const teammate = db.members.some((m) => m.profile_id === p.id && myTeams.has(m.request_id));

  const invited = !!r && db.invitations.some((i) => i.request_id === r.id && i.to_id === p.id && i.type === "invite" && i.status === "pending");
  const canInvite = !!r && r.owner_id === me.id && r.status === "open" && !joinBlocker(db, r, p.id);
  const roles = r ? r.needed_roles.filter((x) => p.skills.includes(x)) : [];

  return (
    <main className="min-h-dvh px-5 pt-7 pb-10 flex flex-col gap-4">
      <BackButton />
      <div className="bg-card rounded-[24px] p-4 flex items-center gap-4">
        <Avatar id={p.avatar_id} size={72} radius={22} alt={p.full_name} />
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className="text-lg font-bold">
            {p.full_name} {p.is_demo && <DemoTag />}
          </span>
          <span className="text-[13px] text-muted">
            {p.major} · {p.entry_year}
          </span>
          <span className="text-[13px] text-muted truncate">{p.campus}</span>
        </div>
      </div>
      {p.bio && <p className="m-0 text-sm leading-normal">{p.bio}</p>}
      <div className="flex gap-2 flex-wrap">
        {p.skills.map((s) => (
          <span key={s} className="bg-lime rounded-lg px-2.5 py-1 text-xs">
            {s}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card rounded-2xl p-3 flex flex-col">
          <span className="text-[11px] text-muted">Free per week</span>
          <span className="font-semibold">{freeHours(db, p.id)} h</span>
        </div>
        <div className="bg-card rounded-2xl p-3 flex flex-col">
          <span className="text-[11px] text-muted">Goal</span>
          <span className="font-semibold">{GOAL_LABEL[p.commitment_goal]}</span>
        </div>
      </div>
      {teammate && contactLinks(p).length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">Contacts</span>
          <ContactList links={contactLinks(p)} />
        </div>
      )}
      <span className="text-[13px] font-semibold">Portfolio</span>
      <PortfolioList items={p.portfolio ?? []} />
      {r && (
        <div className="mt-auto pt-2">
          {invited ? (
            <div className="h-14 rounded-[18px] bg-card flex items-center justify-center font-semibold text-sm text-muted">Invite sent, waiting for reply</div>
          ) : canInvite ? (
            <button
              type="button"
              onClick={() => {
                const res = sendInvite(r.id, p.id, roles, `Hi ${p.full_name.split(" ")[0]}! We need ${roles.join(" and ")} for our team. We aim for ${GOAL_LABEL[r.goal]}, about ${r.min_hours_per_week} h/week.`);
                showToast(res.ok ? `Invite sent to ${p.full_name}` : res.error);
              }}
              className="w-full h-14 rounded-[18px] bg-ink text-white font-bold"
            >
              Invite to {r.title}
            </button>
          ) : null}
        </div>
      )}
    </main>
  );
}

export default function UserProfile() {
  return (
    <Suspense>
      <Body />
    </Suspense>
  );
}
