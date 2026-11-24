"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { makeSeed } from "./seed";
import type { DB, Goal, Invitation, Profile, TeamRequest } from "./types";
import { freeHours, joinBlocker, teamInCompetition } from "./matching";

/*
 * Local demo store. Everything lives in the browser (localStorage) so the
 * frontend runs without a backend. Each action below maps to one Supabase
 * call later (insert / update on the table with the same name).
 */

const KEY = "radar-lomba-demo-v1";
const DEMO_DELAY_MS = 4000;

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

type Result = { ok: true; id?: string } | { ok: false; error: string };

export type NewProfile = Omit<Profile, "id" | "is_demo">;
export type NewRequest = {
  competition_id: string;
  title: string;
  icon_id: number;
  my_roles: string[];
  needed_roles: string[];
  min_hours_per_week: number;
  goal: Goal;
  description: string;
};

type Store = {
  ready: boolean;
  db: DB;
  me: Profile | null;
  now: number;
  toast: string | null;
  showToast: (msg: string) => void;
  createProfile: (p: NewProfile) => void;
  updateProfile: (p: Partial<NewProfile>) => void;
  createRequest: (r: NewRequest) => Result;
  sendInvite: (requestId: string, toId: string, roles: string[], message: string) => Result;
  sendJoin: (requestId: string, roles: string[], message: string) => Result;
  respond: (invitationId: string, accept: boolean) => Result;
  setStatus: (requestId: string, status: TeamRequest["status"]) => void;
  setGroupLink: (requestId: string, link: string) => void;
  leaveTeam: (requestId: string) => void;
  toggleSaved: (competitionId: string) => void;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

// ---- pure helpers that mutate a draft copy of the DB ----

function membersOf(db: DB, requestId: string) {
  return db.members.filter((m) => m.request_id === requestId);
}

function maxSize(db: DB, r: TeamRequest) {
  return db.competitions.find((c) => c.id === r.competition_id)?.max_team_size ?? 4;
}

function nameOf(db: DB, id: string) {
  return db.profiles.find((p) => p.id === id)?.full_name ?? "Someone";
}

function applyAnswer(db: DB, inv: Invitation, accept: boolean): Result {
  const r = db.requests.find((x) => x.id === inv.request_id);
  if (!r) return { ok: false, error: "Team not found." };
  // The person who would join the team:
  const personId = inv.type === "invite" ? inv.to_id : inv.from_id;
  // Who gets told about the answer:
  const tellId = inv.from_id;
  const answerer = inv.to_id;

  if (!accept) {
    inv.status = "declined";
    db.notices.push({
      id: uid("n"),
      to_id: tellId,
      kind: "declined",
      request_id: r.id,
      created_at: Date.now(),
      text:
        inv.type === "invite"
          ? `${nameOf(db, answerer)} declined your invite to ${r.title}`
          : `${r.title} declined your request to join`,
    });
    return { ok: true };
  }

  const blocker = joinBlocker(db, r, personId);
  if (blocker) {
    inv.status = "declined";
    return { ok: false, error: blocker };
  }

  inv.status = "accepted";
  db.members.push({ request_id: r.id, profile_id: personId, roles: inv.roles, joined_at: Date.now() });

  // Close other pending invitations for the same person and competition.
  for (const other of db.invitations) {
    if (other.id === inv.id || other.status !== "pending") continue;
    const or = db.requests.find((x) => x.id === other.request_id);
    const otherPerson = other.type === "invite" ? other.to_id : other.from_id;
    if (or && or.competition_id === r.competition_id && otherPerson === personId) other.status = "declined";
  }

  db.notices.push({
    id: uid("n"),
    to_id: tellId,
    kind: "accepted",
    request_id: r.id,
    created_at: Date.now(),
    text:
      inv.type === "invite"
        ? `${nameOf(db, answerer)} accepted your invite to ${r.title}`
        : `${r.title} accepted your request to join`,
  });

  if (membersOf(db, r.id).length >= maxSize(db, r)) {
    r.status = "full";
    for (const m of membersOf(db, r.id)) {
      db.notices.push({ id: uid("n"), to_id: m.profile_id, kind: "full", request_id: r.id, created_at: Date.now(), text: `${r.title} is full. Your team is ready.` });
    }
  }
  return { ok: true };
}

/** First open demo team whose needed roles overlap my skills. Used once after onboarding. */
function welcomeInvite(db: DB, me: Profile): Invitation | null {
  for (const r of db.requests) {
    const owner = db.profiles.find((p) => p.id === r.owner_id);
    if (!owner?.is_demo || r.status !== "open") continue;
    const roles = r.needed_roles.filter((x) => me.skills.includes(x));
    if (!roles.length) continue;
    if (teamInCompetition(db, me.id, r.competition_id)) continue;
    if (freeHours(db, me.id) < r.min_hours_per_week) continue;
    const comp = db.competitions.find((c) => c.id === r.competition_id);
    if (!comp || new Date(comp.registration_deadline).getTime() < Date.now()) continue;
    return {
      id: uid("i"),
      request_id: r.id,
      from_id: owner.id,
      to_id: me.id,
      type: "invite",
      roles,
      message: `Hi ${me.full_name.split(" ")[0]}! We're aiming for ${r.goal === "win" ? "the win" : r.goal === "finalist" ? "the finals" : "a fun first try"}, about ${r.min_hours_per_week} h/week. Your ${roles.join(" and ")} skills fit what we need.`,
      status: "pending",
      created_at: Date.now() + 2500,
    };
  }
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(() => makeSeed());
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved state once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DB;
        if (parsed.version === 1) setDb(parsed);
      }
    } catch {
      /* storage blocked: run on fresh seed */
    }
    setReady(true);
  }, []);

  // Save on every change.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }, [db, ready]);

  const update = useCallback((fn: (draft: DB) => Result | void): Result => {
    let out: Result = { ok: true };
    setDb((prev) => {
      const draft = structuredClone(prev);
      const r = fn(draft);
      if (r) out = r;
      return r && !r.ok ? prev : draft;
    });
    return out;
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // Demo clock: demo profiles answer pending requests after a short delay.
  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      setDb((prev) => {
        const due = prev.invitations.filter((i) => i.status === "pending" && i.auto_answer_at && i.auto_answer_at <= n);
        if (!due.length) return prev;
        const draft = structuredClone(prev);
        for (const d of due) {
          const inv = draft.invitations.find((x) => x.id === d.id)!;
          inv.auto_answer_at = undefined;
          applyAnswer(draft, inv, true);
        }
        return draft;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const me = useMemo(() => db.profiles.find((p) => p.id === db.me) ?? null, [db]);

  // Actions use the latest committed state through the updater, so they stay
  // correct even if called twice quickly. Validation that needs a message is
  // done against `db` first, then the write goes through `update`.

  const createProfile = useCallback(
    (p: NewProfile) => {
      update((d) => {
        const id = uid("me");
        const profile: Profile = { ...p, id, is_demo: false };
        d.profiles.push(profile);
        d.me = id;
        const inv = welcomeInvite(d, profile);
        if (inv) d.invitations.push(inv);
      });
    },
    [update],
  );

  const updateProfile = useCallback(
    (p: Partial<NewProfile>) => {
      update((d) => {
        const meP = d.profiles.find((x) => x.id === d.me);
        if (meP) Object.assign(meP, p);
      });
    },
    [update],
  );

  const createRequest = useCallback(
    (r: NewRequest): Result => {
      if (!me) return { ok: false, error: "Create your profile first." };
      const existing = teamInCompetition(db, me.id, r.competition_id);
      if (existing) return { ok: false, error: `You're already in ${existing.title} for this competition.` };
      const id = uid("r");
      update((d) => {
        d.requests.push({
          id,
          competition_id: r.competition_id,
          owner_id: me.id,
          title: r.title,
          icon_id: r.icon_id,
          needed_roles: r.needed_roles,
          min_hours_per_week: r.min_hours_per_week,
          goal: r.goal,
          description: r.description,
          group_link: "",
          status: "open",
          created_at: Date.now(),
        });
        d.members.push({ request_id: id, profile_id: me.id, roles: r.my_roles, joined_at: Date.now() });

        // Demo: one eligible demo profile asks to join a few seconds later.
        const taken = new Set(d.members.map((m) => (d.requests.find((x) => x.id === m.request_id)?.competition_id === r.competition_id ? m.profile_id : "")));
        const asker = d.profiles.find(
          (p) =>
            p.is_demo &&
            !taken.has(p.id) &&
            p.skills.some((s) => r.needed_roles.includes(s)) &&
            freeHours(d, p.id) >= r.min_hours_per_week,
        );
        if (asker) {
          const roles = asker.skills.filter((s) => r.needed_roles.includes(s));
          d.invitations.push({
            id: uid("i"),
            request_id: id,
            from_id: asker.id,
            to_id: me.id,
            type: "join",
            roles,
            message: `Hi, I'm ${asker.full_name.split(" ")[0]}, ${asker.major} ${asker.entry_year}. I can cover ${roles.join(" and ")}. ${asker.bio} I have ${freeHours(d, asker.id)} h/week free.`,
            status: "pending",
            created_at: Date.now() + 6000,
          });
        }
      });
      return { ok: true, id };
    },
    [db, me, update],
  );

  const sendInvite = useCallback(
    (requestId: string, toId: string, roles: string[], message: string): Result => {
      if (!me) return { ok: false, error: "Create your profile first." };
      const r = db.requests.find((x) => x.id === requestId);
      if (!r) return { ok: false, error: "Team not found." };
      if (r.status !== "open") return { ok: false, error: "This team is full or closed." };
      const dup = db.invitations.find((i) => i.request_id === requestId && i.to_id === toId && i.status === "pending");
      if (dup) return { ok: false, error: "Invite already sent." };
      const blocker = joinBlocker(db, r, toId);
      if (blocker) return { ok: false, error: blocker.replace("You're", "They're").replace("You have", "They have") };
      const target = db.profiles.find((p) => p.id === toId);
      update((d) => {
        d.invitations.push({
          id: uid("i"),
          request_id: requestId,
          from_id: me.id,
          to_id: toId,
          type: "invite",
          roles,
          message,
          status: "pending",
          created_at: Date.now(),
          auto_answer_at: target?.is_demo ? Date.now() + DEMO_DELAY_MS : undefined,
        });
      });
      return { ok: true };
    },
    [db, me, update],
  );

  const sendJoin = useCallback(
    (requestId: string, roles: string[], message: string): Result => {
      if (!me) return { ok: false, error: "Create your profile first." };
      const r = db.requests.find((x) => x.id === requestId);
      if (!r) return { ok: false, error: "Team not found." };
      if (!roles.length) return { ok: false, error: "Pick at least one role." };
      if (message.trim().length < 20) return { ok: false, error: "Write a short intro (at least 20 characters)." };
      const blocker = joinBlocker(db, r, me.id);
      if (blocker) return { ok: false, error: blocker };
      const dup = db.invitations.find((i) => i.request_id === requestId && i.from_id === me.id && i.status === "pending");
      if (dup) return { ok: false, error: "You already sent a request to this team." };
      const owner = db.profiles.find((p) => p.id === r.owner_id);
      update((d) => {
        d.invitations.push({
          id: uid("i"),
          request_id: requestId,
          from_id: me.id,
          to_id: r.owner_id,
          type: "join",
          roles,
          message: message.trim().slice(0, 300),
          status: "pending",
          created_at: Date.now(),
          auto_answer_at: owner?.is_demo ? Date.now() + DEMO_DELAY_MS + 1000 : undefined,
        });
      });
      return { ok: true };
    },
    [db, me, update],
  );

  const respond = useCallback(
    (invitationId: string, accept: boolean): Result => {
      const inv = db.invitations.find((i) => i.id === invitationId);
      if (!inv || inv.status !== "pending") return { ok: false, error: "This invitation is no longer pending." };
      if (accept) {
        const r = db.requests.find((x) => x.id === inv.request_id);
        const personId = inv.type === "invite" ? inv.to_id : inv.from_id;
        const blocker = r ? joinBlocker(db, r, personId) : "Team not found.";
        if (blocker) {
          update((d) => {
            const x = d.invitations.find((i) => i.id === invitationId);
            if (x) x.status = "declined";
          });
          return { ok: false, error: blocker };
        }
      }
      update((d) => {
        const x = d.invitations.find((i) => i.id === invitationId)!;
        applyAnswer(d, x, accept);
      });
      return { ok: true, id: inv.request_id };
    },
    [db, update],
  );

  const setStatus = useCallback(
    (requestId: string, status: TeamRequest["status"]) => {
      update((d) => {
        const r = d.requests.find((x) => x.id === requestId);
        if (r) r.status = status;
      });
    },
    [update],
  );

  const setGroupLink = useCallback(
    (requestId: string, link: string) => {
      update((d) => {
        const r = d.requests.find((x) => x.id === requestId);
        if (r) r.group_link = link;
      });
    },
    [update],
  );

  const leaveTeam = useCallback(
    (requestId: string) => {
      if (!me) return;
      update((d) => {
        const r = d.requests.find((x) => x.id === requestId);
        if (!r) return;
        d.members = d.members.filter((m) => !(m.request_id === requestId && m.profile_id === me.id));
        if (r.owner_id === me.id) {
          // Owner leaving: hand over to the longest-standing member, or close.
          const next = d.members.filter((m) => m.request_id === requestId).sort((a, b) => a.joined_at - b.joined_at)[0];
          if (next) r.owner_id = next.profile_id;
          else r.status = "closed";
        }
        if (r.status === "full" || (r.status === "closed" && r.owner_id !== me.id)) r.status = "open";
        if (r.owner_id !== me.id) {
          d.notices.push({ id: uid("n"), to_id: r.owner_id, kind: "left", request_id: r.id, created_at: Date.now(), text: `${me.full_name} left ${r.title}. The slot is open again.` });
        }
      });
    },
    [me, update],
  );

  const toggleSaved = useCallback(
    (competitionId: string) => {
      update((d) => {
        d.saved = d.saved.includes(competitionId) ? d.saved.filter((x) => x !== competitionId) : [...d.saved, competitionId];
      });
    },
    [update],
  );

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setDb(makeSeed());
  }, []);

  const value: Store = {
    ready,
    db,
    me,
    now,
    toast,
    showToast,
    createProfile,
    updateProfile,
    createRequest,
    sendInvite,
    sendJoin,
    respond,
    setStatus,
    setGroupLink,
    leaveTeam,
    toggleSaved,
    resetDemo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}

// ---- small selectors ----

export function daysLeft(iso: string, now = Date.now()) {
  return Math.ceil((new Date(iso).getTime() - now) / 86400000);
}

export function visibleInvitations(db: DB, now: number) {
  return db.invitations.filter((i) => i.created_at <= now);
}
