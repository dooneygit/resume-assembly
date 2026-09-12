"""Compiles LaTeX to PDF with whatever engine is on PATH."""

import shutil
import subprocess
import tempfile
from pathlib import Path

import config


class CompileError(RuntimeError):
    def __init__(self, message: str, log: str = ""):
        super().__init__(message)
        self.log = log


def engine_available() -> bool:
    return shutil.which(config.latex_engine()) is not None


def compile_pdf(latex: str, timeout: int = 60) -> bytes:
    engine = config.latex_engine()
    if shutil.which(engine) is None:
        raise CompileError(f"{engine} is not on PATH; returning source only.")

    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        source = workdir / "resume.tex"
        source.write_text(latex, encoding="utf-8")

        command = [
            engine,
            "-interaction=nonstopmode",
            "-halt-on-error",
            f"-output-directory={workdir}",
            str(source),
        ]
        # MiKTeX prompts for missing packages unless told to install silently.
        if "miktex" in (shutil.which(engine) or "").lower():
            command.insert(1, "--enable-installer")

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=workdir,
            )
        except subprocess.TimeoutExpired as exc:
            raise CompileError(f"{engine} timed out after {timeout}s.") from exc

        pdf = workdir / "resume.pdf"
        if not pdf.exists():
            log = (
                (workdir / "resume.log").read_text(encoding="utf-8", errors="replace")
                if (workdir / "resume.log").exists()
                else result.stdout
            )
            raise CompileError(f"{engine} produced no PDF.", log=log[-4000:])

        return pdf.read_bytes()
