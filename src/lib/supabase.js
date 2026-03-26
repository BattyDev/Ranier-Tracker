import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pqshfynscuwapahpzjug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxc2hmeW5zY3V3YXBhaHB6anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMjI5NjUsImV4cCI6MjA4OTg5ODk2NX0.7vGReE6aTFTehZQTKDTaoSSEdBbqIHI-SYb86UNvhsk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth ──
export async function getUsers() {
  const { data } = await supabase.from('users').select('*');
  return data || [];
}

export async function getUserByPin(pin) {
  const { data } = await supabase.from('users').select('*').eq('pin', pin).single();
  return data;
}

// ── Plans ──
export async function getWeeksForUser(userId) {
  const { data } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('week_number');
  return data || [];
}

export async function getPlanForWeek(userId, weekNumber) {
  const { data: plan } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .single();

  if (!plan) return null;

  const { data: days } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order');

  const dayIds = (days || []).map(d => d.id);

  const { data: sections } = await supabase
    .from('plan_sections')
    .select('*')
    .in('day_id', dayIds)
    .order('sort_order');

  const sectionIds = (sections || []).map(s => s.id);

  const { data: exercises } = await supabase
    .from('plan_exercises')
    .select('*')
    .in('section_id', sectionIds)
    .order('sort_order');

  return { plan, days: days || [], sections: sections || [], exercises: exercises || [] };
}

// ── Logs ──
export async function getExerciseLogs(userId, weekNumber) {
  const { data } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber);
  return data || [];
}

export async function getDayCheckIns(userId, weekNumber) {
  const { data } = await supabase
    .from('day_check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber);
  return data || [];
}

export async function upsertExerciseLog(log) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .upsert(log, { onConflict: 'user_id,plan_exercise_id,week_number' })
    .select()
    .single();
  if (error) console.error('upsertExerciseLog error:', error);
  return data;
}

export async function upsertDayCheckIn(checkIn) {
  const { data, error } = await supabase
    .from('day_check_ins')
    .upsert(checkIn, { onConflict: 'user_id,plan_day_id,week_number' })
    .select()
    .single();
  if (error) console.error('upsertDayCheckIn error:', error);
  return data;
}
