"use client";

import type { ParsedResume } from "../lib/types";

type Props = {
  markdown: string;
  onChange: (markdown: string) => void;
  resume: ParsedResume;
  /** Bullet keys selected by the last generation; empty when nothing is generated. */
  keptBullets: Set<string>;
  /** Why each kept bullet was chosen, shown on hover. */
  reasons: Record<string, string>;
  editing: boolean;
};

export function MasterResumeView({
  markdown,
  onChange,
  resume,
  keptBullets,
  reasons,
  editing,
}: Props) {
  if (editing) {
    return (
      <div className="h-full p-4">
        <textarea
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label="Master resume markdown"
          placeholder="# Your Name…"
          className="h-full w-full resize-none rounded-md border border-zinc-300 bg-white p-4 font-mono text-xs leading-relaxed outline-none placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-8 px-6 py-6 font-mono text-sm leading-relaxed">
      <header>
        <h2 className="font-sans text-2xl font-medium tracking-tight">
          {resume.name || "Untitled resume"}
        </h2>
        {resume.contact && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {resume.contact}
          </p>
        )}
      </header>

      {resume.sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-4">
          {section.heading && (
            <h3 className="font-sans text-xl font-medium tracking-tight underline decoration-1 underline-offset-4">
              {section.heading}
            </h3>
          )}

          {section.entries.map((entry) => {
            const kept = entry.bullets.some((b) => keptBullets.has(b.key));
            return (
              <div
                key={entry.id}
                className={`rounded-md border px-3 py-2 transition-colors ${
                  kept
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                    : "border-transparent"
                }`}
              >
                {entry.title && (
                  <div className="flex flex-wrap items-baseline gap-x-2 text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.title}
                    </span>
                    {entry.org && <span>· {entry.org}</span>}
                    {entry.dates && (
                      <span className="ml-auto text-xs">{entry.dates}</span>
                    )}
                  </div>
                )}

                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {entry.bullets.map((bullet) => (
                    <li
                      key={bullet.key}
                      title={reasons[bullet.key] || undefined}
                      className={`flex gap-2 ${
                        keptBullets.size > 0 && !keptBullets.has(bullet.key)
                          ? "text-zinc-400 dark:text-zinc-500"
                          : ""
                      }`}
                    >
                      <span aria-hidden="true">-</span>
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </article>
  );
}
