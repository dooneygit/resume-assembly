"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { errorMessage, fetchResumePdf } from "@/lib/api";
import type { Application } from "@/lib/types";

// Must be set in the same module that renders react-pdf components.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.25;

type LoadState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready"; blob: Blob; url: string };

/** Keyed by application id in the parent, so state resets per application. */
export default function ResumeViewer({ application }: { application: Application }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    fetchResumePdf(application.id).then(
      (blob) => {
        if (cancelled) return;
        if (!blob) return setState({ status: "empty" });
        url = URL.createObjectURL(blob);
        setState({ status: "ready", blob, url });
      },
      (err) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(err) });
      },
    );
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [application.id, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  if (state.status === "loading") return <Centered>Loading resume…</Centered>;
  if (state.status === "empty") {
    return <Centered>No resume has been generated for this application yet.</Centered>;
  }
  if (state.status === "error") {
    return (
      <Centered>
        <p className="text-red-600">{state.message}</p>
        <button
          onClick={retry}
          className="mt-3 rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100"
        >
          Retry
        </button>
      </Centered>
    );
  }

  const fileName = `${application.company}-${application.role}-resume.pdf`.replace(/\s+/g, "-");
  const toolButton =
    "rounded px-2 py-1 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-3 py-1.5 text-sm">
        <button
          className={toolButton}
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="tabular-nums">
          Page {page} of {numPages || "–"}
        </span>
        <button
          className={toolButton}
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= numPages}
          aria-label="Next page"
        >
          ›
        </button>

        <span className="mx-2 h-4 w-px bg-zinc-300" />

        <button
          className={toolButton}
          onClick={() => setScale((s) => s - SCALE_STEP)}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          className={toolButton}
          onClick={() => setScale((s) => s + SCALE_STEP)}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in"
        >
          +
        </button>

        <a
          href={state.url}
          download={fileName}
          className="ml-auto rounded bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-700"
        >
          Download
        </a>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-zinc-100 p-4">
        <Document
          file={state.blob}
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
          onLoadError={(err) => setState({ status: "error", message: errorMessage(err) })}
          loading={<Centered>Rendering…</Centered>}
          className="flex justify-center"
        >
          <Page
            pageNumber={page}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md"
          />
        </Document>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}
