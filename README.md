# Resume Assembler

Takes a master resume in markdown plus a job posting, selects the bullets that
earn their place, and compiles a one-page LaTeX resume.

## Running it

Two servers. Backend first:

```
resume_venv/Scripts/python.exe backend/app.py
```

It listens on port 5001 and reads the OpenAI key from `OPENAI_API_KEY`, falling
back to `resume_builder_api_key.txt` at the repo root (gitignored).

Then the frontend:

```
cd frontend
npm run dev
```

Open http://localhost:3000. Paste a posting into the right panel and press the
arrow button.

## How selection works

`backend/selector.py` sends the job posting and the id-tagged master resume to
the model and gets back bullet ids. The model never writes or rewrites text, so
nothing on the resume is invented. Ranking weighs impressiveness ahead of
topical relevance: a selective internship stays on the page even when the
posting is about something else, and relevance breaks ties.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `OPENAI_API_KEY` | key file | Credential for selection |
| `RESUME_MODEL` | `gpt-4.1` | Model used to rank bullets |
| `RESUME_LATEX_ENGINE` | `pdflatex` | TeX binary to compile with |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:5001` | Backend the UI calls |

If no LaTeX engine is installed the API still returns the source and the UI
falls back to an HTML preview of the same selection.

## Master resume format

```
# Your Name
email · github · linkedin

## Experience

### Role Title — Organization *Dates*
- A bullet.

## Skills

- A skills line.
```
