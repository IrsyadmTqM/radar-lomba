"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PORTFOLIO_TYPES, type PortfolioItem } from "@/lib/types";
import { BackButton, Field, PrimaryArrowButton, inputCls, FormAlert, useFormError } from "@/components/ui";

export default function NewPortfolio() {
  const { addPortfolio, showToast } = useStore();
  const router = useRouter();
  const [type, setType] = useState<PortfolioItem["type"]>("Achievement");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(2026);
  const [link, setLink] = useState("");
  const { error, nonce, setError, clear } = useFormError();

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center gap-3">
        <BackButton href="/profile" />
        <h1 className="m-0 text-[22px] font-bold">Add to portfolio</h1>
      </div>
      <div className="flex gap-2 flex-wrap">
        {PORTFOLIO_TYPES.map((t) => (
          <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={`h-9 px-3.5 rounded-[10px] text-[13px] ${type === t ? "bg-lime" : "bg-card"}`}>
            {t}
          </button>
        ))}
      </div>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finalist, Campus Hack 2025" className={inputCls} />
      </Field>
      <Field label="Year">
        <input type="number" min={2015} max={2027} value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
      </Field>
      <Field label="Proof link" hint="Certificate, repo, article or any page that shows it.">
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" className={inputCls} />
      </Field>
      <FormAlert message={error} nonce={nonce} />
      <div className="mt-auto">
        <PrimaryArrowButton
          onClick={() => {
            if (title.trim().length < 3) return setError("Add a title.");
            if (!/^https?:\/\//.test(link.trim())) return setError("Add a proof link (starting with https://).");
            addPortfolio({ type, title: title.trim(), year, link: link.trim() });
            showToast("Added to portfolio");
            router.push("/profile");
          }}
        >
          Add
        </PrimaryArrowButton>
      </div>
    </main>
  );
}
