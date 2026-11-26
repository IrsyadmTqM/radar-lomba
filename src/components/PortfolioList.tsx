"use client";

import type { PortfolioItem } from "@/lib/types";
import { IconClose, IconExternal } from "@/components/Icons";

const SYMBOL: Record<PortfolioItem["type"], string> = { Achievement: "★", Project: "◆", Publication: "¶", Experience: "●" };

export function PortfolioList({ items, onRemove }: { items: PortfolioItem[]; onRemove?: (id: string) => void }) {
  if (!items.length) return <div className="bg-card rounded-2xl p-4 text-sm text-muted">No portfolio items yet. Add achievements or projects with a proof link.</div>;
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div key={it.id} className="bg-card rounded-2xl p-3 flex items-center gap-3">
          <span aria-hidden="true" className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center font-bold shrink-0">
            {SYMBOL[it.type]}
          </span>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="font-semibold text-sm truncate">{it.title}</span>
            <span className="text-xs text-muted">
              {it.type} · {it.year}
            </span>
          </div>
          <a href={it.link} target="_blank" rel="noreferrer" aria-label={`Open proof for ${it.title}`} className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center">
            <IconExternal size={16} />
          </a>
          {onRemove && (
            <button type="button" aria-label={`Remove ${it.title}`} onClick={() => onRemove(it.id)} className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center">
              <IconClose size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
