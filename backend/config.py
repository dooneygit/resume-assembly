"""Runtime configuration: API credentials, model choice, and LaTeX toolchain."""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# The key file sits at the repo root and is gitignored.
API_KEY_FILE = REPO_ROOT / "resume_builder_api_key.txt"

# gpt-5.x reasoning models are slow for this; a fast general model is enough
# because the task is ranking pre-written bullets, not writing prose.
DEFAULT_MODEL = "gpt-4.1"

# Roughly one page of bullets.
MAX_BULLETS = 16


def api_key() -> str:
    """Reads OPENAI_API_KEY, falling back to the gitignored key file."""
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    if API_KEY_FILE.exists():
        return API_KEY_FILE.read_text(encoding="utf-8-sig").strip()
    raise RuntimeError(
        "No OpenAI key. Set OPENAI_API_KEY or create "
        f"{API_KEY_FILE.name} at the repo root."
    )


def model() -> str:
    return os.environ.get("RESUME_MODEL", DEFAULT_MODEL)


def latex_engine() -> str:
    return os.environ.get("RESUME_LATEX_ENGINE", "pdflatex")
