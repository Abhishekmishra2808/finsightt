# Finsight

AI-powered commercial lending intelligence — balance sheet analysis, GST verification, defaulter search, and map viewer.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
server/     Express API (Gemini proxy, rate limiting)
src/        React frontend (Vite + Tailwind)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build frontend for production |
| `npm run build:server` | Build frontend + Node server (self-hosted) |
| `npm start` | Run production build |
| `npm run lint` | TypeScript check |

## Deploy (production)

Vercel alone cannot run balance sheet analysis reliably (10s timeout on Hobby, ~4.5 MB body limit). Use **Vercel for the frontend** + **Render for the API** (free, no trial expiry).

### 1. Deploy API on Render (free)

1. Go to [render.com](https://render.com) → sign in with GitHub
2. **New +** → **Blueprint** → connect repo `finsightt`
3. Render reads `render.yaml` automatically
4. Add secret **`GEMINI_API_KEY`** when prompted
5. Deploy → copy your URL (e.g. `https://finsight-api.onrender.com`)
6. Test: `https://YOUR-RENDER-URL/api/health` → `"key": "PRESENT"`

> First request after idle may take ~30s (free tier spins down). After that it's fast.

### 2. Deploy frontend on Vercel

1. [vercel.com](https://vercel.com) → import `finsightt` repo
2. Build: `vite build` · Output: `dist`
3. **Environment Variables:**

   | Variable | Value |
   |----------|--------|
   | `VITE_API_BASE_URL` | `https://YOUR-RENDER-URL` (no trailing slash) |
   | `VITE_SUPABASE_URL` | your Supabase URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

4. Deploy → open your Vercel URL and test balance sheet upload

### Local dev

No `VITE_API_BASE_URL` needed — `npm run dev` uses `/api` on localhost automatically.

