import json
import os
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_file

DATA_DIR = Path(__file__).parent / "data"
RESUMES_DIR = DATA_DIR / "resumes"
PROFILE_SECTIONS = ("experiences", "projects", "education", "skills")

app = Flask(__name__)


def read_json(name, default):
    path = DATA_DIR / name
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(name, value):
    DATA_DIR.mkdir(exist_ok=True)
    path = DATA_DIR / name
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(value, indent=2), encoding="utf-8")
    os.replace(tmp, path)


@app.get("/api/applications")
def get_applications():
    return jsonify(read_json("applications.json", []))


@app.put("/api/applications")
def put_applications():
    body = request.get_json(silent=True)
    if not isinstance(body, list) or not all(isinstance(a, dict) for a in body):
        abort(400, "Expected a JSON array of application objects")
    write_json("applications.json", body)
    return "", 204


@app.get("/api/profile")
def get_profile():
    return jsonify(read_json("profile.json", {s: [] for s in PROFILE_SECTIONS}))


@app.put("/api/profile")
def put_profile():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or not all(
        isinstance(body.get(s), list) for s in PROFILE_SECTIONS
    ):
        abort(
            400, f"Expected an object with list fields: {', '.join(PROFILE_SECTIONS)}"
        )
    write_json("profile.json", body)
    return "", 204


@app.get("/api/applications/<app_id>/resume.pdf")
def get_resume(app_id):
    path = (RESUMES_DIR / f"{app_id}.pdf").resolve()
    if path.parent != RESUMES_DIR.resolve() or not path.is_file():
        abort(404)
    return send_file(path, mimetype="application/pdf")


if __name__ == "__main__":
    app.run(port=5000, debug=True)
