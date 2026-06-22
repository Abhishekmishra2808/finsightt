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

## Deploy on Vercel

1. Push your code to GitHub (already done: `Abhishekmishra2808/finsightt`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your `finsightt` repo.
3. Vercel auto-detects settings from `vercel.json`. Confirm:
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
4. Add **Environment Variables** in Vercel project settings:

   | Variable | Notes |
   |----------|-------|
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

5. Click **Deploy**.

### Vercel limits to know

- **Request body:** ~4.5 MB max on serverless — large balance sheet uploads may fail; keep files smaller or use a VPS/Railway for heavy uploads.
- **Function timeout:** Gemini calls can take 30–60s; `vercel.json` sets `maxDuration: 60` (requires Vercel Pro for 60s; Hobby plan is 10s).
- **Rate limiting:** In-memory rate limits reset per serverless instance; still helps but is less strict than a single server.

### After deploy

- Visit your Vercel URL (e.g. `https://finsightt.vercel.app`)
- Test API: `https://your-url.vercel.app/api/health` → should show `"key": "PRESENT"`
