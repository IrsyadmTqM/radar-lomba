"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconInbox, IconTeam, IconTrophy, IconUser } from "./Icons";
import { useStore, visibleInvitations } from "@/lib/store";

const items = [
  { href: "/competitions", label: "Competitions", Icon: IconTrophy },
  { href: "/inbox", label: "Inbox", Icon: IconInbox },
  { href: "/teams", label: "My teams", Icon: IconTeam },
  { href: "/profile", label: "Profile", Icon: IconUser },
];

export function BottomNav() {
  const path = usePathname();
  const { db, me, now } = useStore();
  const pending = me ? visibleInvitations(db, now).filter((i) => i.to_id === me.id && i.status === "pending").length : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-[430px] px-5 pb-[max(24px,env(safe-area-inset-bottom))]">
        <nav aria-label="Main" className="pointer-events-auto h-16 rounded-[22px] bg-ink flex items-center justify-around px-2 shadow-[0_8px_24px_rgba(30,30,30,0.18)]">
          {items.map(({ href, label, Icon }) => {
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${active ? "bg-lime" : ""}`}>
                <Icon size={22} color={active ? "#1E1E1E" : "#E2E0D8"} />
                {href === "/inbox" && pending > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-lime text-ink text-[11px] font-bold flex items-center justify-center border-2 border-ink">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
