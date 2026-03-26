import { SupabaseClient } from '@supabase/supabase-js';

export async function getUserProfile(sb: SupabaseClient, userName: string) {
  const { data, error } = await sb.from('users').select('*').eq('name', userName).single();
  if (error) throw new Error(`User not found: ${error.message}`);
  return data;
}

export async function getCurrentPlan(sb: SupabaseClient, userName: string, weekNumber: number) {
  // Get user
  const user = await getUserProfile(sb, userName);

  // Get plan
  const { data: plan } = await sb
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_number', weekNumber)
    .single();

  if (!plan) return { error: `No plan found for ${userName} week ${weekNumber}` };

  // Get days
  const { data: days } = await sb
    .from('plan_days')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order');

  // Get sections
  const dayIds = (days || []).map((d: any) => d.id);
  const { data: sections } = await sb
    .from('plan_sections')
    .select('*')
    .in('day_id', dayIds)
    .order('sort_order');

  // Get exercises
  const sectionIds = (sections || []).map((s: any) => s.id);
  const { data: exercises } = await sb
    .from('plan_exercises')
    .select('*')
    .in('section_id', sectionIds)
    .order('sort_order');

  return { plan, days, sections, exercises };
}

export async function getExerciseLogs(sb: SupabaseClient, userName: string, weekNumber: number) {
  const user = await getUserProfile(sb, userName);
  const { data } = await sb
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_number', weekNumber);
  return data || [];
}

export async function getProgressSummary(sb: SupabaseClient, userName: string, fromWeek: number, toWeek: number) {
  const user = await getUserProfile(sb, userName);

  // Get all logs in range
  const { data: logs } = await sb
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('week_number', fromWeek)
    .lte('week_number', toWeek);

  // Get all check-ins in range
  const { data: checkIns } = await sb
    .from('day_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .gte('week_number', fromWeek)
    .lte('week_number', toWeek);

  const completedCount = (logs || []).filter((l: any) => l.is_completed).length;
  const painScores = (checkIns || []).filter((c: any) => c.pain_score != null).map((c: any) => c.pain_score);
  const avgPain = painScores.length > 0
    ? (painScores.reduce((a: number, b: number) => a + b, 0) / painScores.length).toFixed(1)
    : null;

  return {
    user: user.display_name,
    week_range: `${fromWeek}-${toWeek}`,
    total_exercises_completed: completedCount,
    total_check_ins: (checkIns || []).length,
    average_pain_score: avgPain,
    pain_scores_by_week: painScores,
    raw_logs: logs,
    raw_check_ins: checkIns,
  };
}
