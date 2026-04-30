# AI-Powered QA Assistant

Production-ready full-stack SaaS application that helps QA engineers generate test cases, generate defect reports, and create Jira bugs using multiple AI providers (OpenAI, Gemini, and Ollama).

## Monorepo Structure

- `frontend/` React + Tailwind dashboard app
- `backend/` Node.js + Express API server

## Features

- Test case generation (functional, negative, boundary)
- AI defect report generation
- Jira bug creation and logging
- Multi-model provider selection
- API key + Jira settings management
- History and dashboard metrics

## Tech Stack

- Frontend: React, React Router, Zustand, Axios, Tailwind CSS
- Backend: Node.js, Express, Mongoose, Axios
- DB: MongoDB
- Security: rate limiting, CORS, validation, sanitization, encrypted tokens

## Quick Start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Environment Variables

Use `backend/.env.example` as reference. Minimum required values:

- `MONGO_URI`
- `ENCRYPTION_KEY` (32+ chars)
- `OPENAI_API_KEY` or `GEMINI_API_KEY` (if using hosted providers)

## API Endpoints

- `POST /api/generate-testcases`
- `POST /api/generate-defect`
- `POST /api/create-jira-issue`
- `GET /api/dashboard/stats`
- `GET /api/history/testcases`
- `GET /api/history/defects`
- `GET /api/history/jira`
- `GET /api/settings`
- `PUT /api/settings`

## Deployment Guide

### Backend

1. Provision MongoDB (MongoDB Atlas recommended).
2. Set environment variables on your host (Render, Railway, Fly.io, Azure, etc.).
3. Run:
   - `npm ci`
   - `npm run start`

### Frontend

1. Set `VITE_API_BASE_URL` to deployed backend URL.
2. Build and deploy:
   - `npm ci`
   - `npm run build`
   - serve `dist/` from Vercel, Netlify, or Nginx.

## Sample Inputs

- Login feature and Checkout feature examples are prefilled in the UI to quickly test generation.
