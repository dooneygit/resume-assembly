export type ParsedBullet = {
  /** Normalized bullet text; stable across edits elsewhere in the document. */
  key: string;
  text: string;
};

export type ParsedEntry = {
  id: string;
  title: string;
  org: string;
  dates: string;
  bullets: ParsedBullet[];
};

export type ParsedSection = {
  id: string;
  heading: string;
  entries: ParsedEntry[];
};

export type ParsedResume = {
  name: string;
  contact: string;
  sections: ParsedSection[];
};

export type GeneratedResume = {
  /** Bullet keys the assembler kept, matched back against the master resume. */
  keptBullets: string[];
  /** Why each kept bullet earned its place, keyed the same way. */
  reasons: Record<string, string>;
  /** One sentence on the angle this resume takes. */
  summary: string;
  latex: string;
  /** The compiled PDF, absent when no LaTeX engine was available. */
  pdfBase64: string | null;
  pdfError: string | null;
};

export type Application = {
  id: string;
  company: string;
  role: string;
  jobPosting: string;
  generated: GeneratedResume | null;
};
