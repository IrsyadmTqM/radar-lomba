"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar, BackButton, Field, PrimaryArrowButton, inputCls } from "@/components/ui";

export default function EditProfile() {
  const { me, updateProfile, showToast } = useStore();
  const router = useRouter();
  const [avatar, setAvatar] = useState(me?.avatar_id ?? 1);
  const [name, setName] = useState(me?.full_name ?? "");
  if (!me) return null;
  return (
    <main className="min-h-dvh px-5 pt-14 pb-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton href="/profile" />
        <h1 className="m-0 text-[22px] font-bold">Edit profile</h1>
      </div>
      <div className="self-center">
        <Avatar id={avatar} size={112} radius={36} alt="Selected avatar" />
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
          <button key={id} type="button" aria-label={`Avatar ${id}`} aria-pressed={id === avatar} onClick={() => setAvatar(id)} className={`aspect-square rounded-[20px] overflow-hidden border-[3px] ${id === avatar ? "border-ink" : "border-transparent"}`}>
            <Avatar id={id} size={80} radius={12} className="!w-full !h-full" />
          </button>
        ))}
      </div>
      <Field label="Full name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <div className="mt-auto">
        <PrimaryArrowButton
          onClick={() => {
            if (name.trim().length < 2) return showToast("Add your name");
            updateProfile({ avatar_id: avatar, full_name: name.trim() });
            showToast("Profile updated");
            router.push("/profile");
          }}
        >
          Save
        </PrimaryArrowButton>
      </div>
    </main>
  );
}
