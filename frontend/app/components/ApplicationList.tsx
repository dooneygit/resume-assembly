"use client";

import type { Application } from "../lib/types";
import { PlusIcon } from "./icons";

type Props = {
  applications: Application[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export function ApplicationList({
  applications,
  selectedId,
  onSelect,
  onCreate,
}: Props) {
  return (
    <nav
      aria-label="Applications"
      className="flex w-56 shrink-0 flex-col border-r border-zinc-300 dark:border-zinc-700"
    >
      <ul className="flex flex-col">
        {applications.map((app) => {
          const selected = app.id === selectedId;
          return (
            <li key={app.id}>
              <button
                type="button"
                onClick={() => onSelect(app.id)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-zinc-300 px-4 py-3 text-left transition-colors dark:border-zinc-700 ${
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <span className="flex w-full items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-4 w-1 rounded-full ${
                      selected ? "bg-emerald-500" : "bg-transparent"
                    }`}
                  />
                  <span className="text-base font-semibold tracking-wide">
                    {app.company}
                  </span>
                  {app.generated && (
                    <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Ready
                    </span>
                  )}
                </span>
                <span className="pl-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {app.role}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 border-b border-zinc-300 px-4 py-3 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <PlusIcon className="h-4 w-4" />
        New application
      </button>
    </nav>
  );
}
