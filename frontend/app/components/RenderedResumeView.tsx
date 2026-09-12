"use client";

import { useEffect, useMemo } from "react";
import type { GeneratedResume, ParsedResume } from "../lib/types";

type Props = {
  resume: ParsedResume;
  generated: GeneratedResume;
};

/** Turns the base64 PDF into an object URL; data: URLs are blocked in frames. */
function usePdfUrl(pdfBase64: string | null) {
  const url = useMemo(() => {
    if (!pdfBase64 || typeof window === "undefined") return null;
    const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  }, [pdfBase64]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
}

export function RenderedResumeView({ resume, generated }: Props) {
  const pdfUrl = usePdfUrl(generated.pdfBase64);
  const kept = new Set(generated.keptBullets);

  const sections = resume.sections
    .map((section) => ({
      ...section,
      entries: section.entries
        .map((entry) => ({
          ...entry,
          bullets: entry.bullets.filter((b) => kept.has(b.key)),
        }))
        .filter((entry) => entry.bullets.length > 0),
    }))
    .filter((section) => section.entries.length > 0);

  return (
    <div className="flex flex-col items-center gap-4 bg-zinc-100 px-6 py-6 dark:bg-zinc-900">
      {generated.summary && (
        <p className="w-full max-w-[8.5in] text-xs italic text-zinc-600 dark:text-zinc-400">
          {generated.summary}
        </p>
      )}

      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Generated resume PDF"
          className="h-[11in] w-full max-w-[8.5in] border-0 bg-white shadow-sm"
        />
      ) : (
        <div className="w-full max-w-[8.5in] bg-white px-12 py-10 font-serif text-[13px] leading-snug text-black shadow-sm">
          {generated.pdfError && (
            <p className="mb-4 border-l-2 border-amber-500 pl-3 font-sans text-[11px] not-italic text-amber-700">
              LaTeX did not compile, so this is an HTML preview of the same
              selection. {generated.pdfError}
            </p>
          )}

          <header className="text-center">
            <h2 className="text-2xl tracking-wide">{resume.name}</h2>
            {resume.contact && (
              <p className="mt-1 text-[11px] text-zinc-700">{resume.contact}</p>
            )}
          </header>

          {sections.map((section) => (
            <section key={section.id} className="mt-6">
              {section.heading && (
                <h3 className="border-b border-black pb-0.5 text-sm font-bold uppercase tracking-[0.15em]">
                  {section.heading}
                </h3>
              )}

              {section.entries.map((entry) => (
                <div key={entry.id} className="mt-3">
                  {entry.title && (
                    <>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-bold">
                          {entry.org || entry.title}
                        </span>
                        <span className="text-[11px] italic">{entry.dates}</span>
                      </div>
                      {entry.org && (
                        <div className="text-[12px] italic">{entry.title}</div>
                      )}
                    </>
                  )}
                  <ul className="mt-1 list-disc pl-5">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet.key} className="mt-0.5">
                        {bullet.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      <details className="w-full max-w-[8.5in]">
        <summary className="cursor-pointer text-xs text-zinc-500 dark:text-zinc-400">
          LaTeX source
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-200">
          {generated.latex}
        </pre>
      </details>
    </div>
  );
}
