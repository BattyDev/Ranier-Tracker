# Rainier Training Tracker

## Overview
A workout tracking app for Cody and Kylie, training for a Mt. Rainier summit in August 2026. The app is database-driven: Claude generates weekly plans via MCP tools, and a Vite + Preact frontend renders them dynamically.

## Architecture
- **Frontend**: Vite + Preact + Signals, deployed on Netlify
- **Database**: Supabase (PostgreSQL) with 7 normalized tables
- **MCP Server**: Cloudflare Worker at `https://battydev.battydev.workers.dev` — gives Claude 9 tools to read/write plans
- **Auth**: PIN-based (no Supabase auth) — Cody: 228626, Kylie: 966337, Demo: 101010

## Database Schema
- `users` — id, name, pin, display_name, avatar_emoji, goal_summary, theme, check_in_type (pain_scale|feeling)
- `workout_plans` — id, user_id, week_number, week_label, week_subtitle, status (active|completed|draft)
- `plan_days` — id, plan_id, day_index (0=Mon), day_label, title, day_type, duration, is_rest_day, rest_message, rest_icon, sort_order
- `plan_sections` — id, day_id, label (e.g. "Warm-up", "Main work"), sort_order
- `plan_exercises` — id, section_id, name, detail, note, description, exercise_type, input_config (JSONB), is_rainier, sort_order
- `exercise_logs` — id, user_id, exercise_id, week_number, log_data (JSONB), is_completed
- `day_check_ins` — id, user_id, day_id, week_number, pain_score, feeling, notes

## Key Patterns

### input_config (JSONB)
Each exercise has an `input_config` that tells the frontend what inputs to render:

**Weighted sets** (weight/reps/feel per set):
```json
{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}
```

**Custom fields** (arbitrary inputs):
```json
{"type":"fields","fields":[
  {"key":"duration","label":"Duration (min)","input_type":"number","placeholder":"10"},
  {"key":"incline","label":"Incline %","input_type":"number","placeholder":"2"}
]}
```

Field input_type options: `number`, `text`, `textarea`, `select` (with `options` array)

### Exercise descriptions
Set `description` on any exercise to provide a plain-language explanation of what it is, proper form, and why it's in the plan. The frontend shows an ℹ button that toggles the description. Claude should populate this when generating plans — especially for exercises users may be unfamiliar with.

### Rainier exercises
Set `is_rainier: true` for incline treadmill / summit training exercises. They get a special mountain badge on the frontend.

## Tech Stack
- `src/` — Preact components, screens, CSS, state management
- `mcp-server/` — Cloudflare Worker (TypeScript)
- `supabase/migrations/` — Schema + seed SQL

## Commands
- `npm run dev` — Start Vite dev server on port 5173
- `npm run build` — Production build to `dist/`
- `cd mcp-server && npx wrangler deploy` — Deploy MCP server
