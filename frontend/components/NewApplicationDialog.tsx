"use client";

import type { FormEvent } from "react";
import type { Application } from "@/lib/types";

type Props = {
  onCreate: (application: Application) => void;
  onCancel: () => void;
};

const FIELDS = [
  { name: "company", label: "Company", required: true },
  { name: "role", label: "Role", required: true },
  { name: "location", label: "Location", required: false },
  { name: "url", label: "Posting URL", required: false, type: "url" },
] as const;

export default function NewApplicationDialog({ onCreate, onCancel }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    onCreate({
      id: crypto.randomUUID(),
      company: text("company"),
      role: text("role"),
      location: text("location"),
      url: text("url"),
      description: text("description"),
    });
  }

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-application-title"
        className="flex max-h-full w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-lg bg-white p-5 text-zinc-900 shadow-xl"
      >
        <h2 id="new-application-title" className="text-lg font-semibold">
          New application
        </h2>
        {FIELDS.map((field, i) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              name={field.name}
              type={"type" in field ? field.type : "text"}
              required={field.required}
              autoFocus={i === 0}
              className="rounded border border-zinc-300 px-2 py-1"
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          Job description
          <textarea
            name="description"
            rows={8}
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1 text-sm hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
