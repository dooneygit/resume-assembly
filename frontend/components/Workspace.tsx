"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DataProvider, useData } from "@/lib/data-context";
import ApplicationSidebar from "./ApplicationSidebar";
import JobPosting from "./JobPosting";
import MasterProfile from "./MasterProfile";

// react-pdf touches browser-only APIs, so it is never server-rendered.
const ResumeViewer = dynamic(() => import("./ResumeViewer"), { ssr: false });

type View = "resume" | "profile";

export default function Workspace() {
  return (
    <DataProvider>
      <WorkspaceLayout />
    </DataProvider>
  );
}

function WorkspaceLayout() {
  const { applications } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("resume");

  // Fall back to the first application if nothing (or a since-removed one) is selected.
  const selected =
    applications.value.find((a) => a.id === selectedId) ?? applications.value[0] ?? null;

  return (
    <div className="flex h-dvh overflow-hidden bg-white font-sans text-zinc-900">
      <ApplicationSidebar selectedId={selected?.id ?? null} onSelect={setSelectedId} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 justify-center border-b border-zinc-200 p-2">
          <div className="inline-flex rounded-lg bg-zinc-100 p-1 text-sm">
            {(
              [
                ["resume", "Resume"],
                ["profile", "Master Profile"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                aria-pressed={view === key}
                className={`rounded-md px-4 py-1 ${
                  view === key ? "bg-white font-medium shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {view === "profile" ? (
            <MasterProfile />
          ) : selected ? (
            <ResumeViewer key={selected.id} application={selected} />
          ) : (
            <p className="p-8 text-center text-sm text-zinc-500">
              Select or create an application to see its resume.
            </p>
          )}
        </div>
      </main>

      <JobPosting application={selected} />
    </div>
  );
}
