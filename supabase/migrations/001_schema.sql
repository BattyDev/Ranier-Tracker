-- ═══════════════════════════════════════════
-- Rainier Training Tracker — Schema
-- ═══════════════════════════════════════════

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pin text not null,
  display_name text not null,
  avatar_emoji text not null default '⛰',
  goal_summary text,
  theme text not null default 'cody',
  check_in_type text not null default 'pain_scale',
  created_at timestamptz not null default now()
);

-- Workout plans (one per user per week)
create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  week_number int not null,
  week_label text not null,
  week_subtitle text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(user_id, week_number)
);

-- Days within a plan
create table if not exists plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references workout_plans(id) on delete cascade,
  day_index int not null,
  day_label text not null,
  title text,
  day_type text not null default 'strength',
  duration text,
  is_rest_day boolean not null default false,
  rest_message text,
  rest_icon text,
  sort_order int not null default 0,
  unique(plan_id, day_index)
);

-- Sections within a day (Warm-up, Main work, Core, etc.)
create table if not exists plan_sections (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references plan_days(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

-- Exercises within a section
create table if not exists plan_exercises (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references plan_sections(id) on delete cascade,
  name text not null,
  detail text,
  note text,
  exercise_type text not null default 'fields',
  input_config jsonb not null default '{}',
  is_rainier boolean not null default false,
  sort_order int not null default 0
);

-- User-entered exercise log data
create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_exercise_id uuid not null references plan_exercises(id) on delete cascade,
  plan_day_id uuid not null references plan_days(id) on delete cascade,
  week_number int not null,
  logged_data jsonb not null default '{}',
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, plan_exercise_id, week_number)
);

-- Day-level check-ins (pain scores, feelings, extra data)
create table if not exists day_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_day_id uuid not null references plan_days(id) on delete cascade,
  week_number int not null,
  pain_score int,
  feeling text,
  day_completed boolean not null default false,
  completed_at timestamptz,
  extra_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, plan_day_id, week_number)
);

-- Indexes for common queries
create index if not exists idx_workout_plans_user on workout_plans(user_id);
create index if not exists idx_plan_days_plan on plan_days(plan_id);
create index if not exists idx_plan_sections_day on plan_sections(day_id);
create index if not exists idx_plan_exercises_section on plan_exercises(section_id);
create index if not exists idx_exercise_logs_user_week on exercise_logs(user_id, week_number);
create index if not exists idx_day_check_ins_user_week on day_check_ins(user_id, week_number);

-- RLS policies (PIN is the security layer, anon access allowed)
alter table users enable row level security;
alter table workout_plans enable row level security;
alter table plan_days enable row level security;
alter table plan_sections enable row level security;
alter table plan_exercises enable row level security;
alter table exercise_logs enable row level security;
alter table day_check_ins enable row level security;

create policy "Public read/write" on users for all using (true) with check (true);
create policy "Public read/write" on workout_plans for all using (true) with check (true);
create policy "Public read/write" on plan_days for all using (true) with check (true);
create policy "Public read/write" on plan_sections for all using (true) with check (true);
create policy "Public read/write" on plan_exercises for all using (true) with check (true);
create policy "Public read/write" on exercise_logs for all using (true) with check (true);
create policy "Public read/write" on day_check_ins for all using (true) with check (true);
