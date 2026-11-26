"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { MAX, SKILLS, WA_GROUP_RE } from "@/lib/types";
import { BackButton, Field, FormAlert, Gone, PrimaryArrowButton, TogglePill, inputCls, teamIconSrc, textareaCls, useDirty, useFormError, useSubmitState } from "@/components/ui";

export default function EditTeam() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const { db, me, updateRequest, showToast } = useStore();
  const r = db.requests.find((x) => x.id === requestId);
  const [title, setTitle] = useState(r?.title ?? "");
  const [icon, setIcon] = useState(r?.icon_id ?? 1);
  const [needed, setNeeded] = useState<string[]>(r?.needed_roles ?? []);
  const [desc, setDesc] = useState(r?.description ?? "");
  const [groupLink, setGroupLink] = useState(r?.group_link ?? "");
  const { error, nonce, setError, clear, invalid } = useFormError();
  const submit = useSubmitState();
  const dirty = useDirty({ title: title.trim(), icon, needed, desc: desc.trim(), groupLink: groupLink.trim() }, { title: r?.title, icon: r?.icon_id, needed: r?.needed_roles, desc: r?.description, groupLink: r?.group_link });

  if (!r) return <Gone title="This team was deleted" body="Everyone left, so the team no longer exists." href="/teams" label="Back to My teams" />;
  if (!me || r.owner_id !== me.id) return null;
  const covered = new Set(db.members.filter((m) => m.request_id === r.id).flatMap((m) => m.roles));

  async function save() {
    if (title.trim().length < 3) return setError("Give your team a name.", "title");
    if (!needed.length) return setError("Pick at least one role you need.", "roles");
    if (!groupLink.trim()) return setError("Add your team's WhatsApp group link.", "group");
    if (!WA_GROUP_RE.test(groupLink.trim())) return setError("Paste a WhatsApp group invite link (https://chat.whatsapp.com/...).", "group");
    clear();
    if (await submit.run(() => updateRequest(r!.id, { title: title.trim(), icon_id: icon, needed_roles: needed, description: desc.trim(), group_link: groupLink.trim() }))) {
      showToast("Team updated");
      router.push(`/teams/${r!.id}`);
    }
  }

  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5" onInput={clear}>
      <div className="flex items-center gap-3">
        <BackButton href={`/teams/${r.id}`} />
        <h1 className="m-0 text-[22px] font-bold">Edit team</h1>
      </div>
      <Field label="Team name">
        <input name="title" aria-invalid={invalid("title")} maxLength={MAX.teamName} value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" aria-label={`Team image ${n}`} aria-pressed={n === icon} onClick={() => setIcon(n)} className={`aspect-square rounded-[18px] p-[3px] ${n === icon ? "bg-lime" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamIconSrc(n)} alt="" className="w-full h-full block rounded-[15px] border-2 border-ink box-border" />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Roles you need</span>
        <div role="group" aria-label="Roles you need" aria-invalid={invalid("roles")} data-field="roles" tabIndex={-1} className="flex flex-wrap gap-2 rounded-2xl outline-none p-1.5 -m-1.5">
          {SKILLS.filter((s) => !covered.has(s) || needed.includes(s)).map((s) => (
            <TogglePill
              key={s}
              on={needed.includes(s)}
              onClick={() => {
                setNeeded((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]));
                clear();
              }}
            >
              {s}
            </TogglePill>
          ))}
        </div>
      </div>
      <Field label="What are you building?">
        <textarea value={desc} maxLength={MAX.teamDesc} onChange={(e) => setDesc(e.target.value)} className={textareaCls} />
      </Field>
      <Field label="Team WhatsApp group link" hint="Only members see it.">
        <input name="group" aria-invalid={invalid("group")} maxLength={MAX.link} value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." inputMode="url" className={inputCls} />
      </Field>
      <FormAlert message={error} nonce={nonce} />
      <div className="mt-auto flex flex-col gap-2">
        <PrimaryArrowButton onClick={save} disabled={!dirty} state={submit.state} doneLabel="Saved">
          Save changes
        </PrimaryArrowButton>
        {!dirty && <span className="text-center text-xs text-muted">Change something above to save.</span>}
      </div>
    </main>
  );
}
