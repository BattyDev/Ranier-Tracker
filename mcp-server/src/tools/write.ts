import { SupabaseClient } from '@supabase/supabase-js';

interface PlanExercise {
  name: string;
  detail?: string;
  note?: string;
  description?: string;
  exercise_type?: string;
  input_config: any;
  is_rainier?: boolean;
}

interface PlanSection {
  label: string;
  exercises: PlanExercise[];
}

interface PlanDay {
  day_index: number;
  day_label: string;
  title?: string;
  day_type?: string;
  duration?: string;
  is_rest_day?: boolean;
  rest_message?: string;
  rest_icon?: string;
  sections: PlanSection[];
}

interface CreatePlanInput {
  week_number: number;
  week_label: string;
  week_subtitle?: string;
  days: PlanDay[];
}

export async function createWeekPlan(sb: SupabaseClient, userName: string, input: CreatePlanInput) {
  // Get user
  const { data: user } = await sb.from('users').select('id').eq('name', userName).single();
  if (!user) throw new Error(`User not found: ${userName}`);

  // Create the plan
  const { data: plan, error: planError } = await sb
    .from('workout_plans')
    .upsert({
      user_id: user.id,
      week_number: input.week_number,
      week_label: input.week_label,
      week_subtitle: input.week_subtitle || '',
      status: 'active',
    }, { onConflict: 'user_id,week_number' })
    .select()
    .single();

  if (planError) throw new Error(`Failed to create plan: ${planError.message}`);

  // Delete existing days for this plan (cascade deletes sections + exercises)
  await sb.from('plan_days').delete().eq('plan_id', plan.id);

  // Insert days, sections, exercises
  for (let di = 0; di < input.days.length; di++) {
    const dayInput = input.days[di];

    const { data: day } = await sb
      .from('plan_days')
      .insert({
        plan_id: plan.id,
        day_index: dayInput.day_index,
        day_label: dayInput.day_label,
        title: dayInput.title || '',
        day_type: dayInput.day_type || 'strength',
        duration: dayInput.duration || null,
        is_rest_day: dayInput.is_rest_day || false,
        rest_message: dayInput.rest_message || null,
        rest_icon: dayInput.rest_icon || null,
        sort_order: di,
      })
      .select()
      .single();

    if (!day) continue;

    for (let si = 0; si < (dayInput.sections || []).length; si++) {
      const sectionInput = dayInput.sections[si];

      const { data: section } = await sb
        .from('plan_sections')
        .insert({
          day_id: day.id,
          label: sectionInput.label,
          sort_order: si,
        })
        .select()
        .single();

      if (!section) continue;

      for (let ei = 0; ei < (sectionInput.exercises || []).length; ei++) {
        const exInput = sectionInput.exercises[ei];

        await sb.from('plan_exercises').insert({
          section_id: section.id,
          name: exInput.name,
          detail: exInput.detail || null,
          note: exInput.note || null,
          description: exInput.description || null,
          exercise_type: exInput.exercise_type || 'fields',
          input_config: exInput.input_config || {},
          is_rainier: exInput.is_rainier || false,
          sort_order: ei,
        });
      }
    }
  }

  return { success: true, plan_id: plan.id, week_number: input.week_number };
}

export async function updateExercise(sb: SupabaseClient, exerciseId: string, changes: any) {
  const { data, error } = await sb
    .from('plan_exercises')
    .update(changes)
    .eq('id', exerciseId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update exercise: ${error.message}`);
  return data;
}

export async function addExercise(sb: SupabaseClient, sectionId: string, exercise: PlanExercise) {
  // Get current max sort_order
  const { data: existing } = await sb
    .from('plan_exercises')
    .select('sort_order')
    .eq('section_id', sectionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await sb
    .from('plan_exercises')
    .insert({
      section_id: sectionId,
      name: exercise.name,
      detail: exercise.detail || null,
      note: exercise.note || null,
      description: exercise.description || null,
      exercise_type: exercise.exercise_type || 'fields',
      input_config: exercise.input_config || {},
      is_rainier: exercise.is_rainier || false,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add exercise: ${error.message}`);
  return data;
}

export async function removeExercise(sb: SupabaseClient, exerciseId: string) {
  const { error } = await sb.from('plan_exercises').delete().eq('id', exerciseId);
  if (error) throw new Error(`Failed to remove exercise: ${error.message}`);
  return { success: true };
}

export async function updatePlanStatus(sb: SupabaseClient, planId: string, status: string) {
  const { data, error } = await sb
    .from('workout_plans')
    .update({ status })
    .eq('id', planId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update plan status: ${error.message}`);
  return data;
}
