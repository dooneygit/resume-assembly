"""Builds a one-page LaTeX resume from the selected bullets."""

import re

from resume_md import Resume

ESCAPES = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}

# Characters that survive a paste from a job board but not a naive pdflatex run.
UNICODE = {
    "—": "---",
    "–": "--",
    "‘": "`",
    "’": "'",
    "“": "``",
    "”": "''",
    "…": r"\ldots{}",
    "·": r"$\cdot$",
    "•": r"$\cdot$",
    " ": " ",
}

PREAMBLE = r"""\documentclass[letterpaper,11pt]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[margin=0.6in]{geometry}
\usepackage{enumitem}

\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlist[itemize]{leftmargin=1.2em,itemsep=1pt,parsep=0pt,topsep=2pt}

% Hand-rolled so the template needs nothing beyond a base TeX install.
\newcommand{\resumesection}[1]{%
  \vspace{8pt}{\large\bfseries\scshape #1}\vspace{2pt}\hrule\vspace{4pt}}
"""


def escape(text: str) -> str:
    # Escape first: the unicode replacements below emit backslashes and math
    # mode, which must not be escaped in turn.
    text = "".join(ESCAPES.get(char, char) for char in text)
    for char, replacement in UNICODE.items():
        text = text.replace(char, replacement)
    return text


def render(resume: Resume, kept_refs: set[str]) -> str:
    """Emits the full LaTeX document, dropping entries with no kept bullets."""
    body: list[str] = [PREAMBLE, r"\begin{document}"]

    body.append(r"\begin{center}")
    body.append(rf"  {{\LARGE \textbf{{{escape(resume.name)}}}}}\\[3pt]")
    if resume.contact:
        body.append(rf"  {{\small {escape(resume.contact)}}}")
    body.append(r"\end{center}")

    for section in resume.sections:
        entries = [
            entry
            for entry in section.entries
            if any(bullet.ref in kept_refs for bullet in entry.bullets)
        ]
        if not entries:
            continue

        body.append(rf"\resumesection{{{escape(section.heading or 'Other')}}}")

        # Experience reads company-first; projects and coursework read name-first.
        org_first = bool(
            re.search(r"experience|work|employment", section.heading, re.I)
        )

        for entry in entries:
            if entry.title or entry.org:
                primary, secondary = (
                    (entry.org, entry.title) if org_first else (entry.title, entry.org)
                )
                if not primary:
                    primary, secondary = secondary, ""
                left = escape(primary)
                body.append(
                    rf"\textbf{{{left}}}\hfill{{\small\textit{{{escape(entry.dates)}}}}}\\"
                )
                if secondary:
                    body.append(rf"{{\small\textit{{{escape(secondary)}}}}}")
            body.append(r"\begin{itemize}")
            for bullet in entry.bullets:
                if bullet.ref in kept_refs:
                    body.append(rf"  \item {escape(bullet.text)}")
            body.append(r"\end{itemize}")

    body.append(r"\end{document}")
    return "\n".join(body)
