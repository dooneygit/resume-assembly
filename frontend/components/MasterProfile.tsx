"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import type { SaveStatus } from "@/lib/synced-document";
import type { Bullet, Profile } from "@/lib/types";

type Entry = { id: string; bullets?: Bullet[] } & Record<string, unknown>;

type Section = {
  key: keyof Profile;
  label: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  hasBullets: boolean;
  summary: (entry: Entry) => string;
};

const join = (...parts: unknown[]) => parts.filter(Boolean).join(" — ");

const SECTIONS: Section[] = [
  {
    key: "experiences",
    label: "Experience",
    fields: [
      { key: "title", label: "Title" },
      { key: "company", label: "Company" },
      { key: "location", label: "Location" },
      { key: "startDate", label: "Start" },
      { key: "endDate", label: "End" },
    ],
    hasBullets: true,
    summary: (e) => join(e.title, e.company),
  },
  {
    key: "projects",
    label: "Projects",
    fields: [
      { key: "name", label: "Name" },
      { key: "url", label: "URL" },
      { key: "startDate", label: "Start" },
      { key: "endDate", label: "End" },
    ],
    hasBullets: true,
    summary: (e) => join(e.name),
  },
  {
    key: "education",
    label: "Education",
    fields: [
      { key: "school", label: "School" },
      { key: "degree", label: "Degree" },
      { key: "location", label: "Location" },
      { key: "startDate", label: "Start" },
      { key: "endDate", label: "End" },
    ],
    hasBullets: true,
    summary: (e) => join(e.degree, e.school),
  },
  {
    key: "skills",
    label: "Skills",
    fields: [
      { key: "category", label: "Category" },
      { key: "skills", label: "Skills (comma-separated)", multiline: true },
    ],
    hasBullets: false,
    summary: (e) => join(e.category),
  },
];

export default function MasterProfile() {
  const { profile } = useData();

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-3">
        <h1 className="text-lg font-semibold">Master Profile</h1>
        <SaveIndicator status={profile.status} error={profile.error} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {SECTIONS.map((section) => (
            <ProfileSection key={section.key} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  if (status === "idle") return null;
  if (status === "error") {
    return (
      <span role="alert" title={error ?? undefined} className="text-sm text-red-600">
        Save failed, changes reverted{error ? `: ${error}` : ""}
      </span>
    );
  }
  return (
    <span
      aria-live="polite"
      className={`text-sm ${status === "saved" ? "text-green-700" : "text-zinc-500"}`}
    >
      {status === "saving" ? "Saving…" : "Saved"}
    </span>
  );
}

function ProfileSection({ section }: { section: Section }) {
  const { profile, updateProfile } = useData();
  const [addedId, setAddedId] = useState<string | null>(null);
  const entries = profile.value[section.key] as Entry[];

  function updateEntries(fn: (entries: Entry[]) => Entry[]) {
    updateProfile((prev) => ({ ...prev, [section.key]: fn(prev[section.key] as Entry[]) }));
  }

  function addEntry() {
    const entry: Entry = { id: crypto.randomUUID() };
    for (const field of section.fields) entry[field.key] = "";
    if (section.hasBullets) entry.bullets = [];
    updateEntries((prev) => [...prev, entry]);
    setAddedId(entry.id);
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {section.label}
        </h2>
        <button
          onClick={addEntry}
          className="rounded px-2 py-1 text-sm text-blue-700 hover:bg-blue-50"
        >
          + Add
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
          Nothing here yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              section={section}
              entry={entry}
              defaultOpen={entry.id === addedId}
              onChange={(next) =>
                updateEntries((prev) => prev.map((e) => (e.id === next.id ? next : e)))
              }
              onDelete={() => updateEntries((prev) => prev.filter((e) => e.id !== entry.id))}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

type EntryCardProps = {
  section: Section;
  entry: Entry;
  defaultOpen: boolean;
  onChange: (entry: Entry) => void;
  onDelete: () => void;
};

function EntryCard({ section, entry, defaultOpen, onChange, onDelete }: EntryCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bullets = entry.bullets ?? [];
  const setBullets = (next: Bullet[]) => onChange({ ...entry, bullets: next });
  const inputClass =
    "w-full rounded border border-zinc-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none";

  return (
    <li className="rounded-lg border border-zinc-200">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
        >
          <span className={`text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
          <span className="truncate font-medium">
            {section.summary(entry) || <span className="text-zinc-400">Untitled</span>}
          </span>
        </button>
        <button
          onClick={() => window.confirm("Delete this entry?") && onDelete()}
          className="mr-2 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-zinc-200 p-3">
          <div className="grid grid-cols-2 gap-2">
            {section.fields.map((field) => (
              <label
                key={field.key}
                className={`flex flex-col gap-1 text-xs text-zinc-600 ${
                  field.multiline ? "col-span-2" : ""
                }`}
              >
                {field.label}
                {field.multiline ? (
                  <textarea
                    value={String(entry[field.key] ?? "")}
                    onChange={(e) => onChange({ ...entry, [field.key]: e.target.value })}
                    rows={2}
                    className={inputClass}
                  />
                ) : (
                  <input
                    value={String(entry[field.key] ?? "")}
                    onChange={(e) => onChange({ ...entry, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>

          {section.hasBullets && (
            <div>
              <p className="mb-1 text-xs text-zinc-600">Bullet points</p>
              <ul className="flex flex-col gap-1">
                {bullets.map((bullet) => (
                  <li key={bullet.id} className="flex items-start gap-2">
                    <span className="pt-1 text-zinc-400">•</span>
                    <textarea
                      value={bullet.text}
                      onChange={(e) =>
                        setBullets(
                          bullets.map((b) =>
                            b.id === bullet.id ? { ...b, text: e.target.value } : b,
                          ),
                        )
                      }
                      rows={1}
                      className={`${inputClass} field-sizing-content resize-none`}
                    />
                    <button
                      onClick={() => setBullets(bullets.filter((b) => b.id !== bullet.id))}
                      aria-label="Delete bullet"
                      className="rounded px-2 py-1 text-zinc-400 hover:bg-red-50 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setBullets([...bullets, { id: crypto.randomUUID(), text: "" }])}
                className="mt-1 rounded px-2 py-1 text-sm text-blue-700 hover:bg-blue-50"
              >
                + Add bullet
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
