"""Parses the master resume markdown into sections, entries, and bullets.

Mirrors the TypeScript parser in frontend/app/lib/markdown.ts, including the
bullet key normalization, so the ids the model returns line up with the
highlights the frontend draws.
"""

import re
from dataclasses import dataclass, field

HEADING_SPLIT = re.compile(r"\s+[—–|]\s+")
DATES = re.compile(r"\*(.+?)\*\s*$")
BULLET = re.compile(r"^[-*]\s+")


def bullet_key(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).lower()


@dataclass
class Bullet:
    key: str
    text: str
    # Assigned after parsing; short handle the model selects by.
    ref: str = ""


@dataclass
class Entry:
    title: str
    org: str
    dates: str
    bullets: list[Bullet] = field(default_factory=list)


@dataclass
class Section:
    heading: str
    entries: list[Entry] = field(default_factory=list)


@dataclass
class Resume:
    name: str = ""
    contact: str = ""
    sections: list[Section] = field(default_factory=list)

    def bullets(self) -> list[Bullet]:
        return [b for s in self.sections for e in s.entries for b in e.bullets]

    def bullet_by_ref(self, ref: str) -> Bullet | None:
        return next((b for b in self.bullets() if b.ref == ref), None)


def parse_resume(markdown: str) -> Resume:
    resume = Resume()
    section: Section | None = None
    entry: Entry | None = None

    def ensure_section() -> Section:
        nonlocal section
        if section is None:
            section = Section(heading="")
            resume.sections.append(section)
        return section

    for raw in markdown.splitlines():
        line = raw.strip()
        if not line:
            continue

        if line.startswith("### "):
            rest = line[4:].strip()
            match = DATES.search(rest)
            dates = match.group(1).strip() if match else ""
            head = rest[: match.start()] if match else rest
            parts = HEADING_SPLIT.split(head, maxsplit=1)
            entry = Entry(
                title=parts[0].strip(),
                org=parts[1].strip() if len(parts) > 1 else "",
                dates=dates,
            )
            ensure_section().entries.append(entry)
            continue

        if line.startswith("## "):
            section = Section(heading=line[3:].strip())
            entry = None
            resume.sections.append(section)
            continue

        if line.startswith("# "):
            resume.name = line[2:].strip()
            continue

        if BULLET.match(line):
            text = BULLET.sub("", line)
            if entry is None:
                # A loose bullet, e.g. a Skills section with no entry heading.
                entry = Entry(title="", org="", dates="")
                ensure_section().entries.append(entry)
            entry.bullets.append(Bullet(key=bullet_key(text), text=text))
            continue

        if section is None and not resume.contact:
            resume.contact = line

    for index, bullet in enumerate(resume.bullets()):
        bullet.ref = f"b{index}"

    return resume
