import type { GeneratedResume } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:5001";

type GenerateResponse = {
  kept_bullets: string[];
  reasons: Record<string, string>;
  summary: string;
  latex: string;
  pdf_base64: string | null;
  pdf_error: string | null;
  error?: string;
};

export async function generateResume(
  masterMarkdown: string,
  jobPosting: string,
): Promise<GeneratedResume> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master_markdown: masterMarkdown,
        job_posting: jobPosting,
      }),
    });
  } catch {
    throw new Error(
      `Could not reach the assembler at ${API_BASE}. Is the Flask server running?`,
    );
  }

  const data = (await response.json()) as GenerateResponse;
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}.`);
  }

  return {
    keptBullets: data.kept_bullets,
    reasons: data.reasons,
    summary: data.summary,
    latex: data.latex,
    pdfBase64: data.pdf_base64,
    pdfError: data.pdf_error,
  };
}
