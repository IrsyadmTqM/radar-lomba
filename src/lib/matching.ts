import type { DB, Profile, TeamRequest } from "./types";
import { GOAL_LABEL } from "./types";

/*
 * Matching rules, kept in one file so they are easy to explain.
 *
 * Score (used only to sort, never shown):
 *   60%  share of the needed roles the candidate has
 *   20%  free hours per week >= the team's minimum
 *   20%  same goal as the team
 *
 * Multi-competition rules:
 *   - A person can join teams in several competitions,
 *     but only one team per competition.
 *   - Hours are counted across all teams. Each team a person is in
 *     uses that team's minimum hours per week. What is left is "free hours".
 */

export const WEIGHTS = { roles: 0.6, hours: 0.2, goal: 0.2 };

export function teamsOf(db: DB, profileId: string): TeamRequest[] {
  const ids = new Set(db.members.filter((m) => m.profile_id === profileId).map((m) => m.request_id));
  return db.requests.filter((r) => ids.has(r.id));
}

export function usedHours(db: DB, profileId: string, exceptRequestId?: string): number {
  return teamsOf(db, profileId)
    .filter((r) => r.id !== exceptRequestId)
    .reduce((sum, r) => sum + r.min_hours_per_week, 0);
}

export function freeHours(db: DB, profileId: string, exceptRequestId?: string): number {
  const p = db.profiles.find((x) => x.id === profileId);
  if (!p) return 0;
  return Math.max(0, p.commitment_hours_per_week - usedHours(db, profileId, exceptRequestId));
}

export function teamInCompetition(db: DB, profileId: string, competitionId: string): TeamRequest | undefined {
  return teamsOf(db, profileId).find((r) => r.competition_id === competitionId);
}

export type Reason = { ok: boolean; text: string };

export type Match = {
  profile: Profile;
  score: number;
  matchedRoles: string[];
  free: number;
  otherTeams: number;
  reasons: Reason[];
};

export function explain(db: DB, request: TeamRequest, profile: Profile): Match {
  const matchedRoles = request.needed_roles.filter((r) => profile.skills.includes(r));
  const free = freeHours(db, profile.id);
  const otherTeams = teamsOf(db, profile.id).length;
  const roleShare = request.needed_roles.length ? matchedRoles.length / request.needed_roles.length : 0;
  const hoursOk = free >= request.min_hours_per_week;
  const goalOk = profile.commitment_goal === request.goal;

  const score = WEIGHTS.roles * roleShare + WEIGHTS.hours * (hoursOk ? 1 : 0) + WEIGHTS.goal * (goalOk ? 1 : 0);

  const reasons: Reason[] = [];
  if (matchedRoles.length === request.needed_roles.length) {
    reasons.push({
      ok: true,
      text: matchedRoles.length === 1 ? `Has the role you need: ${matchedRoles[0]}` : `Has all ${matchedRoles.length} roles you need: ${matchedRoles.join(", ")}`,
    });
  } else if (matchedRoles.length > 0) {
    reasons.push({ ok: true, text: `Has ${matchedRoles.join(", ")} (${matchedRoles.length} of ${request.needed_roles.length} roles)` });
  }
  const hoursText =
    otherTeams > 0
      ? `${free} h/week free after ${otherTeams} other team${otherTeams > 1 ? "s" : ""}`
      : `${free} h/week`;
  reasons.push({
    ok: hoursOk,
    text: hoursOk
      ? `${hoursText}, meets your ${request.min_hours_per_week} h minimum`
      : `${hoursText}, below your ${request.min_hours_per_week} h minimum`,
  });
  reasons.push({
    ok: goalOk,
    text: goalOk ? `Same goal: ${GOAL_LABEL[request.goal]}` : `Different goal: ${GOAL_LABEL[profile.commitment_goal]}`,
  });

  return { profile, score, matchedRoles, free, otherTeams, reasons };
}

/** Eligible candidates for a team request, best fit first. */
export function candidatesFor(db: DB, request: TeamRequest): Match[] {
  const memberIds = new Set(db.members.filter((m) => m.request_id === request.id).map((m) => m.profile_id));
  return db.profiles
    .filter((p) => p.data_consent)
    .filter((p) => !memberIds.has(p.id))
    .filter((p) => !request.kicked?.includes(p.id))
    .filter((p) => p.role !== "admin")
    .filter((p) => !teamInCompetition(db, p.id, request.competition_id)) // one team per competition
    .filter((p) => freeHours(db, p.id) >= request.min_hours_per_week) // enough time left
    .map((p) => explain(db, request, p))
    .filter((m) => m.matchedRoles.length > 0)
    .sort((a, b) => b.score - a.score || b.free - a.free);
}

/** Why a person cannot join this team right now, or null if they can. */
export function joinBlocker(db: DB, request: TeamRequest, profileId: string): string | null {
  if (request.status !== "open") return "This team is not taking new members.";
  if (request.kicked?.includes(profileId)) return "The team owner removed you from this team.";
  const existing = teamInCompetition(db, profileId, request.competition_id);
  if (existing) return `You're already in ${existing.title} for this competition. One team per competition.`;
  const free = freeHours(db, profileId);
  if (free < request.min_hours_per_week)
    return `You have ${free} h/week free across your other teams. This team needs at least ${request.min_hours_per_week} h.`;
  return null;
}
