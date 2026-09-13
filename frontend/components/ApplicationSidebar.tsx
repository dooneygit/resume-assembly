"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import type { Application } from "@/lib/types";
import NewApplicationDialog from "./NewApplicationDialog";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ApplicationSidebar({ selectedId, onSelect }: Props) {
  const { applications, updateApplications } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);

  function handleCreate(application: Application) {
    updateApplications((prev) => [application, ...prev]);
    onSelect(application.id);
    setCreating(false);
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 transition-[width] ${
        collapsed ? "w-14" : "w-[220px]"
      }`}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200"
        >
          {collapsed ? "»" : "«"}
        </button>
        {!collapsed && <span className="truncate text-sm font-semibold">Applications</span>}
      </div>

      <div className="px-2 pb-2">
        <button
          onClick={() => setCreating(true)}
          title="New application"
          aria-label="New application"
          className="flex h-8 w-full items-center justify-center gap-1 rounded bg-zinc-900 text-sm text-white hover:bg-zinc-700"
        >
          <span aria-hidden>+</span>
          {!collapsed && "New application"}
        </button>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {applications.value.map((app) => {
          const selected = app.id === selectedId;
          const label = `${app.company} — ${app.role}`;
          return (
            <li key={app.id}>
              <button
                onClick={() => onSelect(app.id)}
                aria-current={selected ? "true" : undefined}
                title={label}
                className={`mb-0.5 flex h-8 w-full items-center rounded border-l-2 text-left text-sm ${
                  collapsed ? "justify-center" : "px-2"
                } ${
                  selected
                    ? "border-blue-600 bg-blue-100 font-medium text-blue-900"
                    : "border-transparent text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {collapsed ? (
                  <span className="text-xs font-semibold">
                    {app.company.charAt(0).toUpperCase() || "?"}
                  </span>
                ) : (
                  <span className="truncate">{label}</span>
                )}
              </button>
            </li>
          );
        })}
        {applications.value.length === 0 && !collapsed && (
          <li className="px-2 py-4 text-center text-xs text-zinc-500">No applications yet</li>
        )}
      </ul>

      {applications.status === "error" && (
        <p
          role="alert"
          title={applications.error ?? undefined}
          className="border-t border-red-200 bg-red-50 p-2 text-xs text-red-700"
        >
          {collapsed ? "!" : `Save failed, changes reverted. ${applications.error ?? ""}`}
        </p>
      )}

      {creating && (
        <NewApplicationDialog onCreate={handleCreate} onCancel={() => setCreating(false)} />
      )}
    </aside>
  );
}
