"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateResume } from "../lib/api";
import { parseResume } from "../lib/markdown";
import {
  applications as seedApplications,
  initialMasterResume,
} from "../lib/mock-data";
import type { Application } from "../lib/types";
import { ApplicationList } from "./ApplicationList";
import { JobPostingPanel } from "./JobPostingPanel";
import { MasterResumeView } from "./MasterResumeView";
import { RenderedResumeView } from "./RenderedResumeView";
import { GenerateIcon, SpinnerIcon, SwapIcon } from "./icons";

export function Workspace() {
  const [masterMarkdown, setMasterMarkdown] = useState(initialMasterResume);
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [selectedId, setSelectedId] = useState(seedApplications[0].id);
  const [showRendered, setShowRendered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resume = useMemo(() => parseResume(masterMarkdown), [masterMarkdown]);

  // Lets an in-flight generation tell whether the user has switched away.
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selected =
    applications.find((app) => app.id === selectedId) ?? applications[0];

  const keptBullets = useMemo(
    () => new Set(selected.generated?.keptBullets ?? []),
    [selected],
  );

  function updateSelected(patch: Partial<Application>) {
    setApplications((prev) =>
      prev.map((app) => (app.id === selected.id ? { ...app, ...patch } : app)),
    );
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setShowRendered(false);
  }

  function handleCreate() {
    const app: Application = {
      id: `draft-${Date.now()}`,
      company: "New",
      role: "Untitled role",
      jobPosting: "",
      generated: null,
    };
    setApplications((prev) => [...prev, app]);
    setSelectedId(app.id);
    setShowRendered(false);
  }

  async function handleGenerate() {
    if (generating || !selected.jobPosting.trim()) return;
    const target = selected.id;
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateResume(masterMarkdown, selected.jobPosting);
      // The user may have switched applications while the request was in flight.
      setApplications((prev) =>
        prev.map((app) => (app.id === target ? { ...app, generated } : app)),
      );
      if (target === selectedIdRef.current) {
        setEditing(false);
        setShowRendered(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = selected.jobPosting.trim().length > 0 && !generating;
  const canSwap = selected.generated !== null;

  return (
    <div className="flex flex-1 overflow-hidden border border-zinc-300 dark:border-zinc-700">
      <ApplicationList
        applications={applications}
        selectedId={selected.id}
        onSelect={handleSelect}
        onCreate={handleCreate}
      />

      <section aria-label="Resume" className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-300 px-5 dark:border-zinc-700">
          <h2 className="truncate text-xl tracking-tight underline decoration-1 underline-offset-4">
            {showRendered ? `${selected.company} — ${selected.role}` : "Master"}
          </h2>

          {!showRendered && (
            <div className="flex rounded-md border border-zinc-300 p-0.5 text-xs dark:border-zinc-700">
              <ModeButton active={!editing} onClick={() => setEditing(false)}>
                Preview
              </ModeButton>
              <ModeButton active={editing} onClick={() => setEditing(true)}>
                Edit
              </ModeButton>
            </div>
          )}

          <div className="ml-auto flex items-center">
            <PanelButton
              label={generating ? "Generating resume" : "Generate resume"}
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {generating ? (
                <SpinnerIcon className="h-5 w-5 animate-spin" />
              ) : (
                <GenerateIcon className="h-5 w-5" />
              )}
            </PanelButton>

            <PanelButton
              label={showRendered ? "Show master resume" : "Show generated resume"}
              onClick={() => setShowRendered((v) => !v)}
              disabled={!canSwap}
              active={showRendered}
            >
              <SwapIcon className="h-5 w-5" />
            </PanelButton>
          </div>
        </header>

        {error && (
          <p
            role="alert"
            className="shrink-0 border-b border-red-300 bg-red-50 px-5 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {showRendered && selected.generated ? (
            <RenderedResumeView resume={resume} generated={selected.generated} />
          ) : (
            <MasterResumeView
              markdown={masterMarkdown}
              onChange={setMasterMarkdown}
              resume={resume}
              keptBullets={keptBullets}
              reasons={selected.generated?.reasons ?? {}}
              editing={editing}
            />
          )}
        </div>
      </section>

      <JobPostingPanel
        value={selected.jobPosting}
        onChange={(jobPosting) => updateSelected({ jobPosting })}
        company={selected.company}
      />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-2.5 py-1 transition-colors ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function PanelButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-14 w-14 items-center justify-center border-l border-zinc-300 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "enabled:hover:bg-zinc-100 dark:enabled:hover:bg-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}
