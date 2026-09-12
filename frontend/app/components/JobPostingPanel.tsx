"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  company: string;
};

export function JobPostingPanel({ value, onChange, company }: Props) {
  return (
    <section
      aria-label="Job posting"
      className="flex w-[28rem] shrink-0 flex-col border-l border-zinc-300 dark:border-zinc-700"
    >
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-300 px-5 dark:border-zinc-700">
        <h2 className="text-xl tracking-tight underline decoration-1 underline-offset-4">
          Job Posting
        </h2>
        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {company}
        </span>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Paste the job posting here…"
          className="h-full w-full resize-none rounded-md border border-zinc-300 bg-white p-4 font-mono text-xs leading-relaxed outline-none placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
    </section>
  );
}
