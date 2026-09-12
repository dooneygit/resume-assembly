"""Flask API for the resume assembler."""

import base64

from flask import Flask, jsonify, request
from flask_cors import CORS

import compile_pdf
import config
import latex_render
from resume_md import parse_resume
from selector import SelectionError, select_bullets

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "model": config.model(),
            "latex_engine": config.latex_engine(),
            "latex_available": compile_pdf.engine_available(),
        }
    )


@app.post("/api/generate")
def generate():
    """Selects bullets for one posting and returns the typeset resume."""
    payload = request.get_json(silent=True) or {}
    master_markdown = (payload.get("master_markdown") or "").strip()
    job_posting = (payload.get("job_posting") or "").strip()

    if not master_markdown:
        return jsonify({"error": "master_markdown is required."}), 400
    if not job_posting:
        return jsonify({"error": "job_posting is required."}), 400

    resume = parse_resume(master_markdown)

    try:
        selection = select_bullets(resume, job_posting)
    except SelectionError as exc:
        return jsonify({"error": str(exc)}), 502

    kept_refs = set(selection["refs"])
    latex = latex_render.render(resume, kept_refs)

    pdf_base64 = None
    pdf_error = None
    try:
        pdf_base64 = base64.b64encode(compile_pdf.compile_pdf(latex)).decode("ascii")
    except compile_pdf.CompileError as exc:
        pdf_error = str(exc)

    by_ref = {bullet.ref: bullet for bullet in resume.bullets()}
    return jsonify(
        {
            # Keys, not refs: the frontend matches these against its own parse.
            "kept_bullets": [by_ref[ref].key for ref in selection["refs"]],
            "reasons": {
                by_ref[ref].key: reason
                for ref, reason in selection["reasons"].items()
                if ref in by_ref
            },
            "summary": selection["summary"],
            "latex": latex,
            "pdf_base64": pdf_base64,
            "pdf_error": pdf_error,
        }
    )


if __name__ == "__main__":
    app.run(port=5001, debug=True)
