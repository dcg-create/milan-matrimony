# Milan Matrimony — free MVP setup

## 1. Create the free backend
1. Create a free Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication → Providers, enable Google.
4. Add your deployed URL and local URL (`http://localhost:3000`) to the allowed redirect URLs.
5. Copy the project URL and anon key into `.env.local` using `.env.example`.

## 2. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## 3. Deploy for free
Push this folder to GitHub, import it into Vercel, and add the two environment variables.

## Current MVP
- Responsive landing/discovery UI
- Demo profiles
- Search
- Interest/shortlist interaction
- Google OAuth wiring
- Supabase schema for profiles, preferences, interests, messages, blocks and reports
- RLS security policies
- Realtime chat table ready

## Next build step
Connect the profile onboarding, real database queries, photo uploads, mutual-match logic, chat UI and admin moderation screens. Keep the project on free tiers while testing up to ~500 users.
