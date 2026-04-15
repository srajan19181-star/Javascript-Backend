# Fullstack Workspace

This repository now has separate folders for backend and frontend.

## Structure

- `backend/` -> Node.js + Express + MongoDB API
- `frontend/` -> React + Tailwind + React Router + Redux Toolkit UI

## Run Backend

```bash
cd backend
npm run dev
```

Backend entry: `backend/src/index.js`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## CORS Setup

In `backend/.env`, set:

```env
CORS_ORIGIN=http://localhost:5173
```

Default API base URL in frontend is `http://localhost:8000/api/v1`.
