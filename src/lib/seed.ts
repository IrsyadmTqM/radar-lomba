import { IMPORTED_COMPETITIONS } from "./competitions";
import type { Competition, DB, Profile, TeamMember, TeamRequest } from "./types";

// All seed data is fictional and marked "Demo" in the UI.

const demo = (p: Omit<Profile, "is_demo" | "data_consent">): Profile => ({
  ...p,
  is_demo: true,
  data_consent: true,
});

export function makeSeed(): DB {
  const now = Date.now();

  const profiles: Profile[] = [
    demo({ id: "p-andi", full_name: "Andi R.", avatar_id: 1, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Software dev"], bio: "Laravel and Postgres. Built the campus event site.", commitment_hours_per_week: 12, commitment_goal: "finalist", whatsapp: "081234560101", instagram: "andi.dev" }),
    demo({ id: "p-aisyah", full_name: "Aisyah S.", avatar_id: 2, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Software dev", "Design"], bio: "React, Tailwind and Figma. Likes clean dashboards.", commitment_hours_per_week: 10, commitment_goal: "finalist", whatsapp: "081234560102", instagram: "aisyah.ui" }),
    demo({ id: "p-rafi", full_name: "Rafi M.", avatar_id: 3, major: "Mathematics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Data & stats", "Presentation"], bio: "Python, charts and the final pitch deck.", commitment_hours_per_week: 12, commitment_goal: "finalist", whatsapp: "081234560103", instagram: "rafi.m" }),
    demo({ id: "p-sinta", full_name: "Sinta L.", avatar_id: 4, major: "Management", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Design", "Business & finance"], bio: "Product thinking and user research.", commitment_hours_per_week: 9, commitment_goal: "win", whatsapp: "081234560104", instagram: "sinta.lr" }),
    demo({ id: "p-bima", full_name: "Bima P.", avatar_id: 5, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2021, skills: ["Software dev", "Data & stats"], bio: "Two hackathon finals so far.", commitment_hours_per_week: 14, commitment_goal: "win", whatsapp: "081234560105", instagram: "bima.p" }),
    demo({ id: "p-laras", full_name: "Laras A.", avatar_id: 6, major: "Communication", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Presentation", "Writing", "Video & content"], bio: "Scripts and edits pitch videos.", commitment_hours_per_week: 8, commitment_goal: "just_experience", whatsapp: "081234560106", instagram: "laras.a" }),
    demo({ id: "p-yoga", full_name: "Yoga K.", avatar_id: 7, major: "Physics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Data & stats"], bio: "Sensor data and simple models.", commitment_hours_per_week: 10, commitment_goal: "finalist", whatsapp: "081234560107", instagram: "yoga.k" }),
    demo({ id: "p-dewi", full_name: "Dewi N.", avatar_id: 8, major: "Islamic Economics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Business & finance", "Writing"], bio: "Business model canvas and financials.", commitment_hours_per_week: 6, commitment_goal: "just_experience", whatsapp: "081234560108", instagram: "dewi.n" }),
    demo({ id: "p-fikri", full_name: "Fikri H.", avatar_id: 9, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2024, skills: ["Software dev"], bio: "Flutter and React Native.", commitment_hours_per_week: 15, commitment_goal: "win", whatsapp: "081234560109", instagram: "fikri.h" }),
    demo({ id: "p-salma", full_name: "Salma Z.", avatar_id: 10, major: "English Literature", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Writing", "Presentation"], bio: "Debate team. Writes clear proposals.", commitment_hours_per_week: 14, commitment_goal: "finalist", whatsapp: "081234560110", instagram: "salma.z" }),
  ];

  const competitions: Competition[] = IMPORTED_COMPETITIONS;

  const req = (r: Omit<TeamRequest, "status" | "created_at" | "group_link" | "description"> & Partial<TeamRequest>): TeamRequest => ({
    status: "open",
    created_at: now,
    group_link: "",
    description: "",
    ...r,
  });

  const requests: TeamRequest[] = [
    req({ id: "r-ombak", competition_id: "c-020", owner_id: "p-andi", title: "Team Ombak", icon_id: 1, needed_roles: ["Design", "Video & content"], min_hours_per_week: 8, goal: "finalist", description: "Campus shuttle app for the transport challenge. The code is covered, we need design and a short demo video.", group_link: "https://chat.whatsapp.com/demo-ombak" }),
    req({ id: "r-karang", competition_id: "c-020", owner_id: "p-bima", title: "Team Karang", icon_id: 2, needed_roles: ["Software dev", "Presentation"], min_hours_per_week: 12, goal: "win", description: "AI route planner for safer student commutes. Need someone strong on APIs and a confident presenter.", group_link: "https://chat.whatsapp.com/demo-karang" }),
    req({ id: "r-lentera", competition_id: "c-012", owner_id: "p-dewi", title: "Team Lentera", icon_id: 6, needed_roles: ["Presentation", "Data & stats"], min_hours_per_week: 6, goal: "just_experience", description: "First business plan for most of us. Friendly pace.", group_link: "https://chat.whatsapp.com/demo-lentera" }),
    req({ id: "r-daun", competition_id: "c-027", owner_id: "p-sinta", title: "Team Daun", icon_id: 7, needed_roles: ["Design", "Video & content"], min_hours_per_week: 8, goal: "win", description: "A poster concept about campus culture, with a short animated teaser.", group_link: "https://chat.whatsapp.com/demo-daun" }),
    req({ id: "r-petir", competition_id: "c-097", owner_id: "p-fikri", title: "Team Petir", icon_id: 3, needed_roles: ["Design", "Presentation", "Business & finance"], min_hours_per_week: 10, goal: "win", description: "Climate-tech idea: ride sharing between students living near campus.", group_link: "https://chat.whatsapp.com/demo-petir" }),
  ];

  const m = (request_id: string, profile_id: string, roles: string[]): TeamMember => ({ request_id, profile_id, roles, joined_at: now });
  const members: TeamMember[] = [
    m("r-ombak", "p-andi", ["Software dev"]),
    m("r-ombak", "p-rafi", ["Data & stats", "Presentation"]),
    m("r-karang", "p-bima", ["Data & stats"]),
    m("r-lentera", "p-dewi", ["Business & finance"]),
    m("r-lentera", "p-salma", ["Writing"]),
    m("r-daun", "p-sinta", ["Business & finance"]),
    m("r-petir", "p-fikri", ["Software dev"]),
  ];

  return {
    version: 5,
    me: null,
    profiles,
    competitions,
    requests,
    members,
    invitations: [],
    notices: [],
    saved: [],
  };
}
