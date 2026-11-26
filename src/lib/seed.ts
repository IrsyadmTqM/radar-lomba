import type { Competition, DB, Profile, TeamMember, TeamRequest } from "./types";

// All seed data is fictional and marked "Demo" in the UI.

function daysFromNow(days: number): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const demo = (p: Omit<Profile, "is_demo" | "data_consent">): Profile => ({
  ...p,
  is_demo: true,
  data_consent: true,
});

export function makeSeed(): DB {
  const now = Date.now();

  const profiles: Profile[] = [
    demo({ id: "p-andi", full_name: "Andi R.", avatar_id: 1, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Software dev"], bio: "Laravel and Postgres. Built the campus event site.", commitment_hours_per_week: 12, commitment_goal: "finalist", contact: "@andi.dev" }),
    demo({ id: "p-nadia", full_name: "Nadia S.", avatar_id: 2, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Software dev", "Design"], bio: "React, Tailwind and Figma. Likes clean dashboards.", commitment_hours_per_week: 10, commitment_goal: "finalist", contact: "@nadia.ui" }),
    demo({ id: "p-rafi", full_name: "Rafi M.", avatar_id: 3, major: "Mathematics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Data & stats", "Presentation"], bio: "Python, charts and the final pitch deck.", commitment_hours_per_week: 12, commitment_goal: "finalist", contact: "@rafi.m" }),
    demo({ id: "p-sinta", full_name: "Sinta L.", avatar_id: 4, major: "Management", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Design", "Business & finance"], bio: "Product thinking and user research.", commitment_hours_per_week: 9, commitment_goal: "win", contact: "@sinta.lr" }),
    demo({ id: "p-bima", full_name: "Bima P.", avatar_id: 5, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2021, skills: ["Software dev", "Data & stats"], bio: "Two hackathon finals so far.", commitment_hours_per_week: 14, commitment_goal: "win", contact: "@bima.p" }),
    demo({ id: "p-laras", full_name: "Laras A.", avatar_id: 6, major: "Communication", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Presentation", "Writing", "Video & content"], bio: "Scripts and edits pitch videos.", commitment_hours_per_week: 8, commitment_goal: "just_experience", contact: "@laras.a" }),
    demo({ id: "p-yoga", full_name: "Yoga K.", avatar_id: 7, major: "Physics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Data & stats"], bio: "Sensor data and simple models.", commitment_hours_per_week: 10, commitment_goal: "finalist", contact: "@yoga.k" }),
    demo({ id: "p-dewi", full_name: "Dewi N.", avatar_id: 8, major: "Islamic Economics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2023, skills: ["Business & finance", "Writing"], bio: "Business model canvas and financials.", commitment_hours_per_week: 6, commitment_goal: "just_experience", contact: "@dewi.n" }),
    demo({ id: "p-fikri", full_name: "Fikri H.", avatar_id: 9, major: "Informatics", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2024, skills: ["Software dev"], bio: "Flutter and React Native.", commitment_hours_per_week: 15, commitment_goal: "win", contact: "@fikri.h" }),
    demo({ id: "p-salma", full_name: "Salma Z.", avatar_id: 10, major: "English Literature", campus: "UIN Sunan Gunung Djati Bandung", entry_year: 2022, skills: ["Writing", "Presentation"], bio: "Debate team. Writes clear proposals.", commitment_hours_per_week: 14, commitment_goal: "finalist", contact: "@salma.z" }),
  ];

  const competitions: Competition[] = [
    { id: "c-hack", rewards: ["Prize pool Rp5 jt", "Certificate"], name: "Campus Hack 2026", organizer: "Sample Organizer", category: "Tech", subcategory: "Hackathon", link: "https://example.com/campus-hack", registration_deadline: daysFromNow(5), min_team_size: 3, max_team_size: 4, requirements: "Active undergraduate students. Build a working prototype in 48 hours." },
    { id: "c-bcs", rewards: ["Certificate", "Internship fast-track"], name: "Business Case Sprint", organizer: "Sample Business Club", category: "Business", subcategory: "Case study", link: "https://example.com/bcs", registration_deadline: daysFromNow(12), min_team_size: 3, max_team_size: 3, requirements: "Teams of exactly 3. Written case solution plus a 10 minute pitch." },
    { id: "c-uix", rewards: ["Prize pool Rp3 jt"], name: "UI/UX Design Clash", organizer: "Sample Design Community", category: "Design", subcategory: "UI/UX", link: "https://example.com/uix", registration_deadline: daysFromNow(19), min_team_size: 2, max_team_size: 3, requirements: "Figma prototype and a short design rationale." },
    { id: "c-data", rewards: ["Certificate", "Mentoring"], name: "Data Story Challenge", organizer: "Sample Data Society", category: "Tech", subcategory: "Data", link: "https://example.com/data", registration_deadline: daysFromNow(24), min_team_size: 2, max_team_size: 3, requirements: "Analyse an open dataset and present a story with charts." },
    { id: "c-essay", rewards: ["Prize pool Rp2 jt", "Publication"], name: "National Essay Cup", organizer: "Sample Writing Forum", category: "Essay", subcategory: "Essay", link: "https://example.com/essay", registration_deadline: daysFromNow(30), min_team_size: 1, max_team_size: 3, requirements: "Essay of 2,000 to 3,000 words on youth and technology." },
    { id: "c-mobile", rewards: ["Prize pool Rp7 jt"], name: "Mobile App Jam", organizer: "Sample Dev Community", category: "Tech", subcategory: "Mobile", link: "https://example.com/mobile", registration_deadline: daysFromNow(38), min_team_size: 3, max_team_size: 5, requirements: "Android or iOS app that solves a campus problem." },
    { id: "c-robot", rewards: ["Trophy"], name: "Robotics Open Cup", organizer: "Not stated", category: "Tech", subcategory: "Robotics", link: "https://example.com/robotics", registration_deadline: daysFromNow(19), min_team_size: 3, max_team_size: 3, requirements: "Teams of 3. Build and demo a small line-following robot.", student_added: true, added_by: "p-fikri" },
    { id: "c-past", rewards: ["Certificate"], name: "Startup Pitch Day", organizer: "Sample Incubator", category: "Business", subcategory: "Pitching", link: "https://example.com/pitch", registration_deadline: daysFromNow(-2), min_team_size: 2, max_team_size: 4, requirements: "Registration closed." },
  ];

  const req = (r: Omit<TeamRequest, "status" | "created_at" | "group_link" | "description"> & Partial<TeamRequest>): TeamRequest => ({
    status: "open",
    created_at: now,
    group_link: "",
    description: "",
    ...r,
  });

  const requests: TeamRequest[] = [
    req({ id: "r-ombak", competition_id: "c-hack", owner_id: "p-andi", title: "Team Ombak", icon_id: 1, needed_roles: ["Design", "Video & content"], min_hours_per_week: 8, goal: "finalist", description: "Building a campus lost-and-found app. The code is covered, we need design and a short demo video.", group_link: "https://chat.whatsapp.com/demo-ombak" }),
    req({ id: "r-karang", competition_id: "c-hack", owner_id: "p-bima", title: "Team Karang", icon_id: 2, needed_roles: ["Software dev", "Presentation"], min_hours_per_week: 12, goal: "win", description: "AI study planner. Need someone strong on APIs and a confident presenter." }),
    req({ id: "r-lentera", competition_id: "c-bcs", owner_id: "p-dewi", title: "Team Lentera", icon_id: 6, needed_roles: ["Presentation", "Data & stats"], min_hours_per_week: 6, goal: "just_experience", description: "First business case for most of us. Friendly pace." }),
    req({ id: "r-daun", competition_id: "c-uix", owner_id: "p-sinta", title: "Team Daun", icon_id: 7, needed_roles: ["Design", "Software dev"], min_hours_per_week: 8, goal: "win", description: "Redesigning the campus library app." }),
    req({ id: "r-petir", competition_id: "c-mobile", owner_id: "p-fikri", title: "Team Petir", icon_id: 3, needed_roles: ["Design", "Presentation", "Business & finance"], min_hours_per_week: 10, goal: "win", description: "Ride sharing between students living near campus." }),
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
    version: 3,
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
