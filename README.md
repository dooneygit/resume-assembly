# Resume Assembly

Assembles a job-specific resume by having an LLM cherry-pick relevant bullet points, experiences, and projects from a user-maintained master profile, matching them against a given job application.

## Structure

- `backend/` — Flask API, JSON file storage (`backend/data/`)
- `frontend/` — Next.js three-column workspace (applications, master profile, resume preview)

## Running locally

**Backend**

```
cd backend
pip install -r requirements.txt
python app.py
```

Runs on `http://localhost:5000`.

**Frontend**

```
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.
