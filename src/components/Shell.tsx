"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { IconCheck } from "./Icons";

const PUBLIC = ["/", "/onboarding", "/login", "/forgot-password"];

/** Phone-width column, onboarding guard and toast. */
export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, me, toast } = useStore();
  const path = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(path);

  const isAdmin = me?.role === "admin";

  // Keep the last message so the toast can slide out instead of vanishing.
  const [lastToast, setLastToast] = useState(toast);
  useEffect(() => {
    if (toast) setLastToast(toast);
  }, [toast]);

  useEffect(() => {
    if (!ready) return;
    if (!me && !isPublic) router.replace("/");
    // Admins only manage competitions. Students can't open the admin page.
    if (isAdmin && !path.startsWith("/admin")) router.replace("/admin");
    if (me && !isAdmin && path.startsWith("/admin")) router.replace("/competitions");
  }, [ready, me, isPublic, isAdmin, path, router]);

  return (
    <div className="mx-auto max-w-[430px] min-h-dvh bg-paper relative overflow-x-hidden md:shadow-[0_0_0_1px_rgba(30,30,30,0.06)]">
      {!ready || (!me && !isPublic) || (isAdmin && !path.startsWith("/admin")) || (me && !isAdmin && path.startsWith("/admin")) ? (
        <div className="min-h-dvh flex items-center justify-center" aria-busy="true">
          <span className="w-10 h-10 rounded-full border-4 border-sand border-t-ink animate-spin" />
        </div>
      ) : (
        children
      )}
      <div aria-live="polite" className="fixed left-0 right-0 top-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-[430px] px-5 pt-[max(16px,env(safe-area-inset-top))]">
          <div
            className={`flex items-center gap-2.5 rounded-2xl bg-ink text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300 ease-out ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <span className="w-5 h-5 rounded-md bg-lime flex items-center justify-center shrink-0">
              <IconCheck key={toast ?? ""} size={12} color="#1E1E1E" strokeWidth={3.5} className={toast ? "animate-pop" : ""} />
            </span>
            {lastToast}
          </div>
        </div>
      </div>
    </div>
  );
}
