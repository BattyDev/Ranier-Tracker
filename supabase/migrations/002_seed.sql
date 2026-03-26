-- ═══════════════════════════════════════════
-- Seed data: Users + Week 1 plans
-- ═══════════════════════════════════════════

-- ── USERS ──
insert into users (id, name, pin, display_name, avatar_emoji, goal_summary, theme, check_in_type) values
  ('a1000000-0000-0000-0000-000000000001', 'cody', '228626', 'Cody', '⛰', 'Rainier Aug 2026 · Sciatica management · Lower/upper body strength + cardio', 'cody', 'pain_scale'),
  ('a1000000-0000-0000-0000-000000000002', 'kylie', '966337', 'Kylie', '🌟', 'Rainier Aug 2026 · Balanced strength + cardio endurance + yoga recovery', 'kylie', 'feeling')
on conflict (name) do nothing;

-- ═══════════════════════════════════════════
-- CODY — Week 1 (Baseline · Mar 24–30)
-- ═══════════════════════════════════════════

insert into workout_plans (id, user_id, week_number, week_label, week_subtitle, status) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, 'Week 1', 'Baseline · Mar 24–30', 'active');

-- ── MONDAY — Lower body + Core ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 0, 'Monday', 'Lower body + Core', 'strength', '~50–60 min', false, 0);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Warm-up', 0),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Main work', 1),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Core + mobility', 2);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  -- Warm-up
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Treadmill walk (2% incline)', '10 min · moderate pace', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"Duration (min)","input_type":"number","placeholder":"10"},{"key":"incline","label":"Incline %","input_type":"number","placeholder":"2"}]}', false, 0),
  -- Main work
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Leg press machine', '3 sets × 12 reps · feet hip-width', '★ Record baseline weight today', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 0),
  ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Seated hamstring curl', '3 sets × 12 reps · controlled tempo', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 1),
  ('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Hip abductor machine', '3 sets × 15 reps · moderate resistance', 'Key sciatica exercise — glute med strengthening', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 2),
  ('e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Seated calf raise', '3 sets × 15 reps', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 3),
  -- Core + mobility
  ('e1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Dead bug', '3 sets × 8 each side · slow', 'Spine-neutral — essential for sciatica', 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets done","input_type":"number","placeholder":"3"},{"key":"reps","label":"Reps/side","input_type":"number","placeholder":"8"}],"has_notes":true}', false, 0),
  ('e1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Glute bridge', '3 sets × 15 reps · 2-sec hold at top', null, 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets done","input_type":"number","placeholder":"3"},{"key":"reps","label":"Reps","input_type":"number","placeholder":"15"}],"has_notes":true}', false, 1),
  ('e1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Bird dog', '3 sets × 8 each side', null, 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets done","input_type":"number","placeholder":"3"},{"key":"reps","label":"Reps/side","input_type":"number","placeholder":"8"}]}', false, 2);

-- ── TUESDAY — Cardio + Mobility ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1, 'Tuesday', 'Cardio + Mobility', 'cardio', '~40–50 min', false, 1);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Cardio (choose one)', 0),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'Mobility (all three)', 1);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'Dog walk / Treadmill walk', null, null, 'fields',
   '{"type":"fields","fields":[{"key":"activity","label":"Activity","input_type":"select","options":["Dog walk","Treadmill walk","Stationary bike"]},{"key":"duration","label":"Duration (min)","input_type":"number","placeholder":"30"},{"key":"distance","label":"Distance (miles)","input_type":"number","placeholder":"1.5"},{"key":"pace","label":"Avg pace / feel","input_type":"text","placeholder":"Easy / 2.8mph"}]}', false, 0),
  ('e1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000005', 'Standing hip flexor stretch', '3 × 30 sec each side', 'Critical — tight hip flexors aggravate sciatica', 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets","input_type":"number","placeholder":"3"},{"key":"hold","label":"Hold (sec)","input_type":"number","placeholder":"30"}]}', false, 0),
  ('e1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000005', 'Piriformis stretch (figure-4)', '3 × 30 sec each side', 'Loosens piriformis — can compress sciatic nerve', 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets","input_type":"number","placeholder":"3"},{"key":"hold","label":"Hold (sec)","input_type":"number","placeholder":"30"}]}', false, 1),
  ('e1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000005', 'Cat-cow', '10 slow reps · breathe through each', null, 'fields',
   '{"type":"fields","fields":[{"key":"reps","label":"Reps completed","input_type":"number","placeholder":"10"}]}', false, 2);

-- ── WEDNESDAY — Active rest ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, rest_message, rest_icon, sort_order) values
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 2, 'Wednesday', 'Active rest', 'rest', null, true, 'Full rest or a short 15–20 min dog walk. No gym. Sleep 7–9 hrs.', '🌿', 2);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', 'Rest day', 0);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000006', 'Dog walk (optional)', null, null, 'fields',
   '{"type":"fields","fields":[{"key":"walk_minutes","label":"Walk (minutes)","input_type":"number","placeholder":"Optional"}]}', false, 0);

-- ── THURSDAY — Upper body + Core ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 3, 'Thursday', 'Upper body + Core', 'strength', '~50–60 min', false, 3);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000004', 'Warm-up', 0),
  ('c1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000004', 'Main work', 1),
  ('c1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000004', 'Core', 2);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  -- Warm-up
  ('e1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000007', 'Rowing machine', '5 min · easy pace', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"Duration (min)","input_type":"number","placeholder":"5"},{"key":"resistance","label":"Resistance","input_type":"number","placeholder":"3"}]}', false, 0),
  -- Main work
  ('e1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000008', 'Chest press machine (seated)', '3 sets × 12 reps · moderate weight', '★ Record baseline weight today', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 0),
  ('e1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000008', 'Seated cable row', '3 sets × 12 reps · squeeze shoulder blades', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 1),
  ('e1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000008', 'Lat pulldown', '3 sets × 12 reps · controlled descent', 'Critical for hiking pack carry strength', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 2),
  ('e1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000008', 'DB shoulder press (seated)', '3 sets × 10 reps · light-moderate', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 3),
  ('e1000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000008', 'Bicep curl (dumbbell)', '2 sets × 12 reps', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":2,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 4),
  ('e1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000008', 'Tricep pushdown (cable)', '2 sets × 12 reps', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":2,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 5),
  -- Core
  ('e1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000009', 'Plank (knees or full)', '3 sets · 20–30 sec · flat back', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1 (sec)","input_type":"number","placeholder":"20"},{"key":"s2","label":"Set 2 (sec)","input_type":"number","placeholder":"20"},{"key":"s3","label":"Set 3 (sec)","input_type":"number","placeholder":"20"},{"key":"plank_type","label":"Type","input_type":"select","options":["Knees plank","Full plank"]}]}', false, 0),
  ('e1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000009', 'Side-lying clamshell', '3 sets × 12 each side', 'Reduces sciatic nerve load via glute activation', 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets done","input_type":"number","placeholder":"3"},{"key":"reps","label":"Reps/side","input_type":"number","placeholder":"12"}]}', false, 1);

-- ── FRIDAY — Active rest ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, rest_message, rest_icon, sort_order) values
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 4, 'Friday', 'Active rest', 'rest', null, true, 'Rest or light dog walk (15 min). Big training day Saturday — conserve energy.', '🐕', 4);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000005', 'Rest day', 0);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000010', 'Dog walk (optional)', null, null, 'fields',
   '{"type":"fields","fields":[{"key":"walk_minutes","label":"Walk (minutes)","input_type":"number","placeholder":"Optional"}]}', false, 0);

-- ── SATURDAY — Rainier prep + Full body ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 5, 'Saturday', 'Rainier prep + Full body', 'rainier', '~60–75 min', false, 5);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000006', 'Rainier training — incline walk', 0),
  ('c1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000006', 'Main work', 1),
  ('c1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000006', 'Core', 2);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  -- Rainier training
  ('e1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000011', 'Incline treadmill (weekly summit session)', null, null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"Duration (min)","input_type":"number","placeholder":"20"},{"key":"incline","label":"Incline %","input_type":"number","placeholder":"8"},{"key":"speed","label":"Speed (mph)","input_type":"number","placeholder":"2.8"},{"key":"felt","label":"Felt (1–10)","input_type":"number","placeholder":"7"}],"accent":"rainier"}', true, 0),
  -- Main work
  ('e1000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000012', 'Goblet squat (light DB)', '3 sets × 10 reps · pain-free depth only', 'Assess squat comfort — note depth achieved', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 0),
  ('e1000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000012', 'Romanian deadlift (light DBs)', '3 sets × 10 reps · hinge at hips', 'Note any lower back discomfort', 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":true}', false, 1),
  ('e1000000-0000-0000-0000-000000000027', 'c1000000-0000-0000-0000-000000000012', 'Seated cable row', '3 sets × 12 reps', null, 'weighted_sets',
   '{"type":"weighted_sets","sets":3,"fields_per_set":["weight","reps","feel"],"has_notes":false}', false, 2),
  -- Core
  ('e1000000-0000-0000-0000-000000000028', 'c1000000-0000-0000-0000-000000000013', 'Dead bug', '2 sets × 8 each side', null, 'fields',
   '{"type":"fields","fields":[{"key":"sets","label":"Sets done","input_type":"number","placeholder":"2"},{"key":"reps","label":"Reps/side","input_type":"number","placeholder":"8"}]}', false, 0),
  ('e1000000-0000-0000-0000-000000000029', 'c1000000-0000-0000-0000-000000000013', 'Glute bridge hold', '2 sets × 20 sec holds', null, 'fields',
   '{"type":"fields","fields":[{"key":"h1","label":"Hold 1 (sec)","input_type":"number","placeholder":"20"},{"key":"h2","label":"Hold 2 (sec)","input_type":"number","placeholder":"20"}]}', false, 1);

-- ── SUNDAY — Full rest ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, rest_message, rest_icon, sort_order) values
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000001', 6, 'Sunday', 'Full rest', 'rest', null, true, 'Complete rest. Dog walk optional. Prep your gym bag for Monday.', '🏔', 6);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c1000000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000007', 'Rest day', 0),
  ('c1000000-0000-0000-0000-000000000015', 'd1000000-0000-0000-0000-000000000007', 'Weekly tracking', 1);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e1000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000014', 'Dog walk (optional)', null, null, 'fields',
   '{"type":"fields","fields":[{"key":"walk_minutes","label":"Walk (minutes)","input_type":"number","placeholder":"Optional"}]}', false, 0),
  ('e1000000-0000-0000-0000-000000000031', 'c1000000-0000-0000-0000-000000000015', 'Weekly weight', 'Weigh in Sunday morning for most consistent tracking', null, 'fields',
   '{"type":"fields","fields":[{"key":"weight","label":"Weight (lbs)","input_type":"number","placeholder":"270"}]}', false, 0);


-- ═══════════════════════════════════════════
-- KYLIE — Week 1 (Mar 24–29)
-- ═══════════════════════════════════════════

insert into workout_plans (id, user_id, week_number, week_label, week_subtitle, status) values
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 1, 'Week 1', 'Mar 24–29', 'active');

-- ── TUESDAY — Lower body strength ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 1, 'Tuesday', 'Lower body strength', 'strength', '~55 min', false, 0);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c2000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'Warm-up', 0),
  ('c2000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000001', 'Main work', 1),
  ('c2000000-0000-0000-0000-000000000003', 'd2000000-0000-0000-0000-000000000001', 'Cool-down', 2);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Treadmill warm-up — incline 2–3%', '10 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"10"},{"key":"incline","label":"%","input_type":"number","placeholder":"3"}]}', true, 0),
  ('e2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Leg press machine', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', false, 0),
  ('e2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'Goblet squat', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', true, 1),
  ('e2000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000002', 'Seated leg curl machine', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', false, 2),
  ('e2000000-0000-0000-0000-000000000005', 'c2000000-0000-0000-0000-000000000002', 'Standing calf raises', '3 sets × 15 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', true, 3),
  ('e2000000-0000-0000-0000-000000000006', 'c2000000-0000-0000-0000-000000000002', 'Hip abductor machine', '2 sets × 15 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"}]}', false, 4),
  ('e2000000-0000-0000-0000-000000000007', 'c2000000-0000-0000-0000-000000000003', 'Cool-down stretch', '5–8 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"notes","label":"notes","input_type":"textarea","placeholder":"How did it feel?"}]}', false, 0);

-- ── THURSDAY — Cardio endurance ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 3, 'Thursday', 'Cardio endurance', 'cardio', '~50 min', false, 1);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c2000000-0000-0000-0000-000000000004', 'd2000000-0000-0000-0000-000000000002', 'Cardio', 0),
  ('c2000000-0000-0000-0000-000000000005', 'd2000000-0000-0000-0000-000000000002', 'Cool-down', 1);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e2000000-0000-0000-0000-000000000008', 'c2000000-0000-0000-0000-000000000004', 'Treadmill incline intervals (2 min flat / 2 min at 4–6%)', '35 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"35"},{"key":"max_inc","label":"max %","input_type":"number","placeholder":"6"},{"key":"speed","label":"mph","input_type":"number","placeholder":"3.5"}]}', true, 0),
  ('e2000000-0000-0000-0000-000000000009', 'c2000000-0000-0000-0000-000000000004', 'OR: Outdoor walk (brisk, hilly route)', '35 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"35"},{"key":"miles","label":"mi","input_type":"number","placeholder":"1.5"}]}', true, 1),
  ('e2000000-0000-0000-0000-000000000010', 'c2000000-0000-0000-0000-000000000005', 'Stationary bike cool-down', '10 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"10"}]}', false, 0),
  ('e2000000-0000-0000-0000-000000000011', 'c2000000-0000-0000-0000-000000000005', 'Foam rolling — quads, IT band, calves', '5 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"notes","label":"notes","input_type":"textarea","placeholder":"Anything tight?"}]}', false, 1);

-- ── SATURDAY — Upper body + core ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 5, 'Saturday', 'Upper body + core', 'strength', '~55 min', false, 2);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c2000000-0000-0000-0000-000000000006', 'd2000000-0000-0000-0000-000000000003', 'Warm-up', 0),
  ('c2000000-0000-0000-0000-000000000007', 'd2000000-0000-0000-0000-000000000003', 'Main work', 1),
  ('c2000000-0000-0000-0000-000000000008', 'd2000000-0000-0000-0000-000000000003', 'Core', 2);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e2000000-0000-0000-0000-000000000012', 'c2000000-0000-0000-0000-000000000006', 'Elliptical warm-up — easy pace', '8 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"8"}]}', false, 0),
  ('e2000000-0000-0000-0000-000000000013', 'c2000000-0000-0000-0000-000000000007', 'Seated cable row', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', false, 0),
  ('e2000000-0000-0000-0000-000000000014', 'c2000000-0000-0000-0000-000000000007', 'Dumbbell shoulder press', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', true, 1),
  ('e2000000-0000-0000-0000-000000000015', 'c2000000-0000-0000-0000-000000000007', 'Lat pulldown machine', '3 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"lbs"}]}', true, 2),
  ('e2000000-0000-0000-0000-000000000016', 'c2000000-0000-0000-0000-000000000007', 'Dumbbell bicep curl', '2 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"}]}', false, 3),
  ('e2000000-0000-0000-0000-000000000017', 'c2000000-0000-0000-0000-000000000007', 'Tricep pushdown — cable', '2 sets × 12 reps', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"lbs"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"lbs"}]}', false, 4),
  ('e2000000-0000-0000-0000-000000000018', 'c2000000-0000-0000-0000-000000000008', 'Plank hold', '3 × 20–30 sec', null, 'fields',
   '{"type":"fields","fields":[{"key":"s1","label":"Set 1","input_type":"number","placeholder":"sec"},{"key":"s2","label":"Set 2","input_type":"number","placeholder":"sec"},{"key":"s3","label":"Set 3","input_type":"number","placeholder":"sec"}]}', true, 0),
  ('e2000000-0000-0000-0000-000000000019', 'c2000000-0000-0000-0000-000000000008', 'Dead bug — core stability', '2 × 10 each side', null, 'fields',
   '{"type":"fields","fields":[{"key":"notes","label":"notes","input_type":"textarea","placeholder":"How was your form?"}]}', true, 1);

-- ── SUNDAY — Yoga / active recovery ──
insert into plan_days (id, plan_id, day_index, day_label, title, day_type, duration, is_rest_day, sort_order) values
  ('d2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 6, 'Sunday', 'Yoga / active recovery', 'recovery', '~50 min', false, 3);

insert into plan_sections (id, day_id, label, sort_order) values
  ('c2000000-0000-0000-0000-000000000009', 'd2000000-0000-0000-0000-000000000004', 'Recovery', 0);

insert into plan_exercises (id, section_id, name, detail, note, exercise_type, input_config, is_rainier, sort_order) values
  ('e2000000-0000-0000-0000-000000000020', 'c2000000-0000-0000-0000-000000000009', 'Yoga class OR guided stretching session', '30–60 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"45"},{"key":"type","label":"type","input_type":"text","placeholder":"class / solo"}]}', false, 0),
  ('e2000000-0000-0000-0000-000000000021', 'c2000000-0000-0000-0000-000000000009', 'Bonus easy outdoor walk (optional)', '~20 min', null, 'fields',
   '{"type":"fields","fields":[{"key":"duration","label":"min","input_type":"number","placeholder":"20"},{"key":"miles","label":"mi","input_type":"number","placeholder":"0.8"}]}', true, 1);
