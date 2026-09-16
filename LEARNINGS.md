# Ruko — learnings log

Running log. One entry per milestone: what was new, what broke, how it was fixed, and a short
plain-English explanation so every piece can be explained on camera and to mentors.

---

## Day 1 (Thu 17 Sept) — repo skeleton

**New:** Repo laid out as `backend/` (AWS SAM), `frontend/` (PWA), `samples/`, `scripts/`.

**What broke:** Nothing yet.

**How it works, plainly:** The project is split so that each half can be deployed on its own. The
backend is described in one file (`backend/template.yaml`) that AWS reads and turns into real
infrastructure, so nothing is ever clicked together by hand and the whole stack can be rebuilt from
scratch. The frontend is a plain static site that talks to the backend over HTTPS.

**Private samples:** Harsh's real screenshots live in `samples/private/`, which is listed in
`.gitignore` and never committed. Only synthetic samples go into the public repo.
