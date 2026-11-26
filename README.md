# Radar Lomba (frontend preview)

Radar Lomba helps undergraduates at one pilot campus (UIN Sunan Gunung Djati Bandung) form teams for a specific competition, matched on skills and commitment. Built for STACK 2026, Case 1: Smarter Campus and Learning.

This folder is the **frontend only**. It runs on fictional demo data stored in the browser (localStorage), so the whole flow can be clicked through without a backend. Supabase comes next.

## Run locally

Needs Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your phone width (Chrome DevTools, device toolbar), or on your phone over the same Wi-Fi.

Production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, choose **Add New → Project**, import the repository, and keep the default Next.js settings.
3. No environment variables are needed for this preview. `.env.example` lists the Supabase keys for later.

## Demo flow (good for the video)

1. **Create my profile**: email + password (demo, no confirmation), one of 10 avatars, roles (12 cross-major roles, several allowed), major, hours per week and goal.
2. A demo team invites you a few seconds later if your skills fit. Accept it in **Inbox**.
3. Open a competition: see teams looking for people, with the roles you have highlighted. **Request to join** with roles and a short intro message. The demo owner accepts after about 5 seconds.
4. In a competition with no team of yours, tap **Find teammates** → post your team (image, roles you cover, roles you need, minimum hours, goal) → see matching candidates with a checklist of reasons → **Send invite**. Demo candidates accept after about 4 seconds, and a demo student may ask to join.
5. **My teams** shows your time across competitions. The **team page** has the registration countdown, members with contacts (members only), the WhatsApp group link, "We're complete" and "Leave team".
6. **Profile → Reset demo** starts over.

"I already have an account" opens a ready-made demo account (Dimas A.).

**Remove a member (team owner):** on the team page the owner sees a **Remove** button next to each member. Tap twice to confirm. The person gets a notice in their inbox, the slot opens again, and they cannot request to join that team again.

**Admin:** on the sign-in page, tap "Demo: open admin view". The admin has two pages only. **Manage competitions** (`/admin`) has two tabs: **Official** (Remove) and **Added by students** (Hide/Unhide, with a "Possible duplicate" flag), plus a **+** button. **New competition** (`/admin/new`) takes a poster, name, organizer, category, deadline, team size, link and rules, then **Publish competition**. It appears in every student's list right away (with the poster). A competition can be removed only while no team exists for it. Admins cannot open student pages and students cannot open `/admin`.

## Rules the app enforces

- One team per competition, but you can join several competitions.
- Hours are counted across teams. Each team you are in uses its minimum hours per week from your total. Candidate search and join requests only allow people with enough free hours.
- A team turns **full** at the competition's maximum team size and stops taking requests.
- Contacts stay hidden until someone is in the same team.
- Only the team owner can remove members. Students can add a competition ("Not listed? Add a competition", shown as "Added by a student"); only the student who added it can edit or delete it, and admins can hide it.
- Match score is only used to sort candidates. The UI shows a checklist, never a number.

The matching logic lives in one file: `src/lib/matching.ts`.

## Project structure

```
src/
  app/                      pages (Next.js App Router)
    page.tsx                welcome
    onboarding/             3-step profile setup
    login/                  demo sign-in
    competitions/           list, detail, join request, post a team
    teams/                  my teams, team page, candidates, team ready
    inbox/                  received and sent, accept / decline
    profile/                edit profile, reset demo
  components/               bottom nav, icons, shared UI
  lib/
    types.ts                data shapes (match the planned Supabase tables)
    seed.ts                 fictional demo data
    matching.ts             score, free hours, eligibility rules
    store.tsx               local demo store; each action maps to one Supabase call later
public/
  avatars/                  10 preset avatars (no photo upload)
  team-icons/               10 preset team images (objects, no people)
  illustrations/, logo/, icons/, manifest.webmanifest
```

## Connecting Supabase later

Replace the actions in `src/lib/store.tsx` (`createProfile`, `createRequest`, `sendInvite`, `sendJoin`, `respond`, `leaveTeam`, and so on) with Supabase queries on the tables of the same names. `src/lib/types.ts` already follows that schema. Remove the demo auto-answer timer when real users answer.

## Complete vs not yet

Complete in this preview: every screen, the multi-competition rules, PWA manifest and icons, empty and error states.

Not yet: real sign-in and real admin accounts (the admin here is a demo button), poster storage (posters are small images kept in the browser), database, server-side checks (RLS), CSV import of competitions, push notifications, offline caching (service worker).

## Known limitations

- Data lives in one browser only. Clearing site data resets it.
- All competitions, teams and people are fictional and marked "Demo" or "Sample". Links are placeholders.
- Demo profiles answer automatically after a few seconds to show the flow.

## Third-party resources and AI assistance

- Next.js, React, Tailwind CSS (MIT licence). Font: Urbanist (Google Fonts, SIL Open Font Licence).
- Avatars, team images and illustrations were made for this project.
- This code was written with an AI coding assistant (Claude) and reviewed by the team.


## Also in this build

Rewards as free-typed tags, poster view, Official site link, saved competitions, all-teams page, other students' profile page (with Invite), portfolio items with proof links, edit profile, account settings (email/password, delete account), popup confirms, edit team, Sent tab in Inbox. All data is stored in this browser only (`localStorage`). Mockup and simulated data are labelled "Demo".
