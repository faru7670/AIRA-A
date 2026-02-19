# AIRA-AI

A production-oriented multimodal AI web app with ChatGPT-like UX.

## Features
- React + Vite + Tailwind glassmorphism dark interface
- Unified `/api/chat` backend endpoint for text + files (image, audio, PDF)
- OpenRouter for reasoning/chat
- Hugging Face Inference API for image captioning, speech-to-text, text-to-speech, and PDF summarization
- Google OAuth login + session auth + email verification
- Guest mode (no history) and logged-in mode (history saved in session-backed server memory)
- Streaming chat responses via Server-Sent Events
- Downloadable conversation summaries

## Project Structure

```text
/client
  /src
    /components
    /pages
    /services
    /styles
    main.jsx
    App.jsx
    index.css
  vite.config.js
  package.json

/server
  /routes
  /services
  /middleware
  /config
  index.js
  package.json
  .env.example
```

## Setup
1. Install dependencies at root:
   ```bash
   npm install
   ```
2. Configure backend env:
   ```bash
   cp server/.env.example server/.env
   ```
   Fill all API keys and OAuth/SMTP values.
3. Run both backend + frontend:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Scripts
- Root:
  - `npm run dev` → starts frontend + backend together
  - `npm run build` → builds frontend
  - `npm run start` → runs backend production server
- Client:
  - `npm run dev -w client`
  - `npm run build -w client`
- Server:
  - `npm run dev -w server`
  - `npm run start -w server`

## Notes
- API keys are server-only; frontend never sees provider secrets.
- For local dev, session cookies use non-secure mode; set `secure: true` behind HTTPS in production.
- Chat history is persisted in memory for verified users only. Add Redis/Postgres for durable production storage.
