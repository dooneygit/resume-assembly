"""Chooses which master-resume bullets belong on a resume for one job posting."""

import json

from openai import OpenAI

import config
from resume_md import Resume

SYSTEM_PROMPT = """\
You assemble a one-page resume by selecting bullets from a candidate's master \
resume for a specific job posting.

Select bullets. Never write, rewrite, merge, or paraphrase them. You return \
only the ids of bullets to keep.

How to rank:
1. Impressiveness first. The prestige of the organization, the scope of the \
work, and the size of the measured outcome carry more weight than topical \
overlap with the posting. A selective internship or a research result at a \
top lab belongs on the resume even when the posting is about something else; \
it beats a directly relevant hobby project.
2. Relevance second, as a tiebreaker among comparable items, and to decide \
which bullets within a strong entry to keep.
3. Prefer bullets with concrete numbers and shipped outcomes over bullets \
describing responsibilities.
4. Keep the strongest one or two bullets of an entry rather than all of a \
weak entry. Dropping a whole weak entry is correct when stronger material \
would otherwise be cut for space.
5. Always keep skills lines that the posting explicitly asks for.

Budget: at most %(max_bullets)d bullets in total, fewer if the master resume \
is short. The result must fit one page.
"""

RESPONSE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["selected", "summary"],
    "properties": {
        "selected": {
            "type": "array",
            "description": "Bullet ids to keep, strongest first within each entry.",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["id", "reason"],
                "properties": {
                    "id": {"type": "string"},
                    "reason": {
                        "type": "string",
                        "description": "One short clause on why it earned the space.",
                    },
                },
            },
        },
        "summary": {
            "type": "string",
            "description": "One sentence on the angle this resume takes.",
        },
    },
}


def describe_resume(resume: Resume) -> str:
    """Renders the master resume as an id-tagged outline for the model."""
    lines: list[str] = []
    for section in resume.sections:
        lines.append(f"## {section.heading or 'Other'}")
        for entry in section.entries:
            header = " | ".join(p for p in (entry.title, entry.org, entry.dates) if p)
            if header:
                lines.append(f"### {header}")
            for bullet in entry.bullets:
                lines.append(f"[{bullet.ref}] {bullet.text}")
        lines.append("")
    return "\n".join(lines)


class SelectionError(RuntimeError):
    pass


def select_bullets(resume: Resume, job_posting: str) -> dict:
    """Returns {"refs": [...], "reasons": {ref: str}, "summary": str}."""
    if not resume.bullets():
        raise SelectionError("The master resume has no bullets to select from.")

    client = OpenAI(api_key=config.api_key())
    user_prompt = (
        f"JOB POSTING\n{job_posting.strip()}\n\n"
        f"MASTER RESUME\n{describe_resume(resume)}"
    )

    try:
        response = client.chat.completions.create(
            model=config.model(),
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT % {"max_bullets": config.MAX_BULLETS},
                },
                {"role": "user", "content": user_prompt},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "bullet_selection",
                    "strict": True,
                    "schema": RESPONSE_SCHEMA,
                },
            },
        )
    except Exception as exc:  # network, auth, quota, unknown model
        raise SelectionError(f"OpenAI request failed: {exc}") from exc

    try:
        payload = json.loads(response.choices[0].message.content or "{}")
    except json.JSONDecodeError as exc:
        raise SelectionError("The model returned malformed JSON.") from exc

    reasons: dict[str, str] = {}
    for item in payload.get("selected", []):
        ref = str(item.get("id", "")).strip()
        # Ignore ids the model invented; only real bullets can be kept.
        if resume.bullet_by_ref(ref):
            reasons.setdefault(ref, str(item.get("reason", "")))

    if not reasons:
        raise SelectionError("The model selected no bullets from the master resume.")

    # Keep master-resume order so the document reads chronologically.
    refs = [b.ref for b in resume.bullets() if b.ref in reasons]
    return {"refs": refs, "reasons": reasons, "summary": payload.get("summary", "")}
