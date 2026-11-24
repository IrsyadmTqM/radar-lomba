"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { daysLeft, useStore, visibleInvitations } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";
import { IconBell, IconFilter, IconSearch } from "@/components/Icons";
import { SectionTitle } from "@/components/ui";

const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function Competitions() {
  const { db, me, now } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [onlyOpenTeams, setOnlyOpenTeams] = useState(false);

  const pending = me ? visibleInvitations(db, now).filter((i) => i.to_id === me.id && i.status === "pending").length : 0;

  const list = useMemo(() => {
    return db.competitions
      .filter((c) => daysLeft(c.registration_deadline, now) >= 0) // hide past deadlines
      .filter((c) => cat === "All" || c.category === cat)
      .filter((c) => !q.trim() || `${c.name} ${c.organizer} ${c.subcategory}`.toLowerCase().includes(q.trim().toLowerCase()))
      .map((c) => ({ c, open: db.requests.filter((r) => r.competition_id === c.id && r.status === "open").length }))
      .filter((x) => !onlyOpenTeams || x.open > 0)
      .sort((a, b) => a.c.registration_deadline.localeCompare(b.c.registration_deadline));
  }, [db, cat, q, onlyOpenTeams, now]);

  const [first, ...rest] = list;

  return (
    <main className="px-5 pt-14 pb-32 flex flex-col gap-[18px]">
      <div className="flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/radar-lomba-logo.png" alt="Radar Lomba" className="h-[34px] w-auto" />
        <Link href="/inbox" aria-label={`Inbox${pending ? `, ${pending} pending` : ""}`} className="relative w-11 h-11 rounded-[14px] bg-card flex items-center justify-center">
          <IconBell />
          {pending > 0 && <span className="absolute top-2.5 right-[11px] w-2 h-2 rounded-full bg-lime-dark border-2 border-card box-content" />}
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Hi, {me?.full_name.split(" ")[0]}</span>
        <h1 className="m-0 text-[28px] leading-[1.15] font-bold">
          Find a competition.
          <br />
          Build the right team.
        </h1>
      </div>

      <div className="flex gap-2.5">
        <label className="flex-1 h-12 rounded-2xl bg-sand flex items-center gap-2.5 px-3.5">
          <IconSearch size={18} color="#686961" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search competitions" aria-label="Search competitions" className="border-none bg-transparent text-[15px] text-ink outline-none w-full" />
        </label>
        <button
          type="button"
          aria-label="Only competitions with open teams"
          aria-pressed={onlyOpenTeams}
          onClick={() => setOnlyOpenTeams((v) => !v)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${onlyOpenTeams ? "bg-lime" : "bg-ink"}`}
        >
          <IconFilter color={onlyOpenTeams ? "#1E1E1E" : "#CEEC68"} />
        </button>
      </div>
      {onlyOpenTeams && <span className="-mt-2 text-xs text-muted">Showing only competitions with teams looking for people</span>}

      <div className="flex gap-2 flex-wrap">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`h-9 px-3.5 rounded-[10px] text-[13px] ${cat === c ? "bg-lime" : "bg-card"}`}>
            {c}
          </button>
        ))}
      </div>

      <SectionTitle title="Closing soon" aside="Nearest deadline first" />

      {!first && (
        <div className="bg-card rounded-[22px] p-6 text-center flex flex-col gap-1">
          <span className="font-semibold">No competitions match</span>
          <span className="text-sm text-muted">Try another keyword or category.</span>
        </div>
      )}

      {first && (
        <Link href={`/competitions/${first.c.id}`} className="no-underline text-ink bg-lime rounded-3xl p-[18px] flex flex-col gap-3.5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs">
                {first.c.category} · {first.c.subcategory}
              </span>
              <span className="text-[22px] font-bold leading-tight">{first.c.name}</span>
              <span className="text-[13px]">by {first.c.organizer}</span>
            </div>
            <div className="bg-ink text-lime rounded-[14px] px-2.5 py-2 text-center flex flex-col shrink-0">
              <span className="text-[22px] font-bold leading-none">{daysLeft(first.c.registration_deadline, now)}</span>
              <span className="text-[11px]">days left</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-card rounded-[10px] px-2.5 py-1.5 text-xs">
              Team {first.c.min_team_size === first.c.max_team_size ? first.c.max_team_size : `${first.c.min_team_size}–${first.c.max_team_size}`}
            </span>
            <span className="bg-card rounded-[10px] px-2.5 py-1.5 text-xs">
              {first.open} team{first.open === 1 ? "" : "s"} looking
            </span>
          </div>
        </Link>
      )}

      <div className="flex flex-col gap-2.5">
        {rest.map(({ c, open }) => (
          <Link key={c.id} href={`/competitions/${c.id}`} className="no-underline text-ink bg-card rounded-[20px] p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-sand flex items-center justify-center font-bold shrink-0">{initials(c.name)}</div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-[15px] truncate">{c.name}</span>
              <span className="text-xs text-muted">
                {c.category} · Team {c.min_team_size === c.max_team_size ? c.max_team_size : `${c.min_team_size}–${c.max_team_size}`}
                {open > 0 && ` · ${open} looking`}
              </span>
            </div>
            <span className="text-xs bg-paper rounded-lg px-2 py-1.5 shrink-0">{daysLeft(c.registration_deadline, now)} d</span>
          </Link>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
