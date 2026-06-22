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
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | TypeScript check |
