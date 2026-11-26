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
              <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center ${active ? "bg-lime text-ink" : "text-sand hover:text-white hover:bg-white/10"}`}>
                <Icon size={22} className={`transition-transform duration-200 ${active ? "animate-pop" : "group-hover:-translate-y-px"}`} />
                {href === "/inbox" && pending > 0 && (
                  <span aria-label={`${pending} pending`} className="absolute top-[9px] right-[11px] w-2 h-2 rounded-full bg-lime border-2 border-ink box-content" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
