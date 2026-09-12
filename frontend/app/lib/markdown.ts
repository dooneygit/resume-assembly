import type { ParsedEntry, ParsedResume, ParsedSection } from "./types";

/** Bullets are matched by normalized text so highlights survive edits elsewhere. */
export function bulletKey(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Parses the master resume's markdown:
 *   `# Name`, a contact line, `## Section`, `### Title — Org *Dates*`, `- bullet`.
 */
export function parseResume(markdown: string): ParsedResume {
  const resume: ParsedResume = { name: "", contact: "", sections: [] };
  let section: ParsedSection | null = null;
  let entry: ParsedEntry | null = null;

  markdown.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;

    if (line.startsWith("### ")) {
      const rest = line.slice(4).trim();
      const dateMatch = rest.match(/\*(.+?)\*\s*$/);
      const dates = dateMatch ? dateMatch[1].trim() : "";
      const [title, org = ""] = (dateMatch ? rest.slice(0, dateMatch.index) : rest)
        .split(/\s+[—–|]\s+/);
      entry = {
        id: `entry-${index}`,
        title: (title ?? "").trim(),
        org: org.trim(),
        dates,
        bullets: [],
      };
      if (!section) {
        section = { id: `section-${index}`, heading: "", entries: [] };
        resume.sections.push(section);
      }
      section.entries.push(entry);
      return;
    }

    if (line.startsWith("## ")) {
      section = {
        id: `section-${index}`,
        heading: line.slice(3).trim(),
        entries: [],
      };
      entry = null;
      resume.sections.push(section);
      return;
    }

    if (line.startsWith("# ")) {
      resume.name = line.slice(2).trim();
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      const text = line.replace(/^[-*]\s+/, "");
      if (!entry) {
        // A loose bullet, e.g. a Skills section with no entry heading.
        entry = {
          id: `entry-${index}`,
          title: "",
          org: "",
          dates: "",
          bullets: [],
        };
        if (!section) {
          section = { id: `section-${index}`, heading: "", entries: [] };
          resume.sections.push(section);
        }
        section.entries.push(entry);
      }
      entry.bullets.push({ key: bulletKey(text), text });
      return;
    }

    // Any other prose directly under the name is the contact line.
    if (!section && !resume.contact) resume.contact = line;
  });

  return resume;
}
