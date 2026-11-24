"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

const PUBLIC = ["/", "/onboarding", "/login"];

/** Phone-width column, onboarding guard and toast. */
export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, me, toast } = useStore();
  const path = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(path);

  useEffect(() => {
    if (ready && !me && !isPublic) router.replace("/");
  }, [ready, me, isPublic, router]);

  return (
    <div className="mx-auto max-w-[430px] min-h-dvh bg-paper relative overflow-x-hidden md:shadow-[0_0_0_1px_rgba(30,30,30,0.06)]">
      {!ready || (!me && !isPublic) ? (
        <div className="min-h-dvh flex items-center justify-center" aria-busy="true">
          <span className="w-10 h-10 rounded-full border-4 border-sand border-t-ink animate-spin" />
        </div>
      ) : (
        children
      )}
      <div aria-live="polite" className="fixed left-0 right-0 top-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-[430px] px-5 pt-[max(16px,env(safe-area-inset-top))]">
          {toast && <div className="animate-rise rounded-2xl bg-ink text-white px-4 py-3 text-sm font-semibold shadow-lg">{toast}</div>}
        </div>
      </div>
    </div>
  );
}
