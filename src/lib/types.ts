// Shapes mirror the Supabase tables planned in the build prompt,
// so swapping the local demo store for Supabase later changes only lib/store.

export type Goal = "just_experience" | "finalist" | "win";

export const GOAL_LABEL: Record<Goal, string> = {
  just_experience: "experience",
  finalist: "finalist",
  win: "win",
};

export const GOAL_OPTIONS: { value: Goal; title: string; hint: string }[] = [
  { value: "just_experience", title: "Just for experience", hint: "Relaxed, here to learn and build a portfolio" },
  { value: "finalist", title: "Aim for the finals", hint: "Serious, ready to work on a steady schedule" },
  { value: "win", title: "Go all out to win", hint: "Ready for late nights, pitch practice and more" },
];

export const SKILLS = [
  "Leader",
  "Research",
  "Writing",
  "Presentation",
  "Design",
  "Video & content",
  "Business & finance",
  "Software dev",
  "Data & stats",
  "Engineering",
  "Science / Lab",
  "Public speaking",
] as const;

export const CATEGORIES = ["Tech", "Business", "Design", "Essay"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PORTFOLIO_TYPES = ["Achievement", "Project", "Publication", "Experience"] as const;
export type PortfolioItem = { id: string; type: (typeof PORTFOLIO_TYPES)[number]; title: string; year: number; link: string };

export type Profile = {
  id: string;
  full_name: string;
  avatar_id: number; // 1–10, preset illustration
  major: string;
  campus: string;
  entry_year: number;
  skills: string[];
  bio: string;
  commitment_hours_per_week: number;
  commitment_goal: Goal;
  whatsapp: string; // required, digits as typed (08xx / +62xx)
  instagram?: string; // optional handle
  linkedin?: string; // optional username or profile URL
  data_consent: boolean;
  is_demo: boolean;
  email?: string;
  password?: string; // demo only: kept in this browser to confirm account changes
  portfolio?: PortfolioItem[];
  role?: "student" | "admin"; // admins only manage the competition list
};

export type Competition = {
  id: string;
  name: string;
  organizer: string;
  category: Category;
  subcategory: string;
  link: string;
  registration_deadline: string; // ISO date
  min_team_size: number;
  max_team_size: number;
  requirements: string;
  rewards: string[]; // free-typed tags, e.g. "Prize pool Rp5 jt"
  student_added?: boolean; // added by a student, shown as "Added by a student"
  hidden?: boolean; // hidden by an admin
  poster?: string; // small image as data URL (Supabase Storage later)
  added_by?: string; // profile id of whoever added it
};

export type RequestStatus = "open" | "full" | "closed";

export type TeamRequest = {
  id: string;
  competition_id: string;
  owner_id: string;
  title: string;
  icon_id: number; // 1–10, preset team icon
  needed_roles: string[];
  min_hours_per_week: number;
  goal: Goal;
  description: string;
  group_link: string;
  status: RequestStatus;
  created_at: number;
  kicked?: string[]; // profile ids removed by the owner, cannot re-request
};

export type TeamMember = {
  request_id: string;
  profile_id: string;
  roles: string[];
  joined_at: number;
};

export type InvitationStatus = "pending" | "accepted" | "declined";

export type Invitation = {
  id: string;
  request_id: string;
  from_id: string;
  to_id: string;
  type: "invite" | "join";
  roles: string[];
  message: string;
  status: InvitationStatus;
  created_at: number;
  dismissed_by?: string[]; // profile ids that cleared it from their inbox
  // Demo only: when a demo profile should answer automatically.
  auto_answer_at?: number;
};

export type Notice = {
  id: string;
  to_id: string;
  text: string;
  kind: "accepted" | "declined" | "left" | "full" | "kicked";
  request_id: string;
  created_at: number;
};

export type DB = {
  version: number;
  me: string | null;
  profiles: Profile[];
  competitions: Competition[];
  requests: TeamRequest[];
  members: TeamMember[];
  invitations: Invitation[];
  notices: Notice[];
  saved: string[]; // saved competition ids
};

export const DEFAULT_CAMPUS = "UIN Sunan Gunung Djati Bandung";

/** Max lengths for free-text fields, shared by every form. */
export const MAX = {
  name: 50,
  email: 80,
  campus: 80,
  major: 60,
  bio: 160,
  whatsapp: 16,
  instagram: 30,
  linkedin: 100,
  teamName: 30,
  teamDesc: 200,
  compName: 80,
  organizer: 60,
  compType: 40,
  link: 200,
  reward: 40,
  rules: 300,
} as const;

export const WA_GROUP_RE = /^https:\/\/chat\.whatsapp\.com\/\S+$/;
