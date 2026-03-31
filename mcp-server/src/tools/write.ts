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

// --- copy_week_with_changes types ---

interface ExerciseChange {
  day: string;           // day_label to match, e.g. "Monday"
  exercise?: string;     // exercise name to match (for update/remove)
  section?: string;      // section label (for add)
  update?: Record<string, any>;  // fields to update on matched exercise
  add?: PlanExercise;    // new exercise to insert into section
  remove?: boolean;      // if true, remove the matched exercise
}

interface DayChange {
  day: string;           // day_label to match
  update?: Record<string, any>;  // fields to update on the day (title, duration, day_type, etc.)
}

interface CopyWeekInput {
  source_week: number;
  target_week: number;
  target_label: string;
  target_subtitle?: string;
  exercise_changes?: ExerciseChange[];
  day_changes?: DayChange[];
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

export async function copyWeekWithChanges(sb: SupabaseClient, userName: string, input: CopyWeekInput) {
  // Get user
  const { data: user } = await sb.from('users').select('id').eq('name', userName).single();
  if (!user) throw new Error(`User not found: ${userName}`);

  // Get source plan
  const { data: sourcePlan } = await sb
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_number', input.source_week)
    .single();
  if (!sourcePlan) throw new Error(`No plan found for ${userName} week ${input.source_week}`);

  // Get source days
  const { data: sourceDays } = await sb
    .from('plan_days')
    .select('*')
    .eq('plan_id', sourcePlan.id)
    .order('sort_order');
  if (!sourceDays) throw new Error('Failed to fetch source days');

  // Get source sections
  const dayIds = sourceDays.map((d: any) => d.id);
  const { data: sourceSections } = await sb
    .from('plan_sections')
    .select('*')
    .in('day_id', dayIds)
    .order('sort_order');

  // Get source exercises
  const sectionIds = (sourceSections || []).map((s: any) => s.id);
  const { data: sourceExercises } = await sb
    .from('plan_exercises')
    .select('*')
    .in('section_id', sectionIds)
    .order('sort_order');

  // Build lookup maps
  const sectionsByDay = new Map<string, any[]>();
  for (const s of sourceSections || []) {
    const list = sectionsByDay.get(s.day_id) || [];
    list.push(s);
    sectionsByDay.set(s.day_id, list);
  }

  const exercisesBySection = new Map<string, any[]>();
  for (const e of sourceExercises || []) {
    const list = exercisesBySection.get(e.section_id) || [];
    list.push(e);
    exercisesBySection.set(e.section_id, list);
  }

  // Index day changes by day_label (case-insensitive)
  const dayChangeMap = new Map<string, Record<string, any>>();
  for (const dc of input.day_changes || []) {
    dayChangeMap.set(dc.day.toLowerCase(), dc.update || {});
  }

  // Index exercise changes by day_label (case-insensitive)
  const exerciseChangesByDay = new Map<string, ExerciseChange[]>();
  for (const ec of input.exercise_changes || []) {
    const key = ec.day.toLowerCase();
    const list = exerciseChangesByDay.get(key) || [];
    list.push(ec);
    exerciseChangesByDay.set(key, list);
  }

  // Create or upsert target plan
  const { data: targetPlan, error: planError } = await sb
    .from('workout_plans')
    .upsert({
      user_id: user.id,
      week_number: input.target_week,
      week_label: input.target_label,
      week_subtitle: input.target_subtitle || '',
      status: 'active',
    }, { onConflict: 'user_id,week_number' })
    .select()
    .single();

  if (planError) throw new Error(`Failed to create target plan: ${planError.message}`);

  // Delete existing days for target plan (cascade)
  await sb.from('plan_days').delete().eq('plan_id', targetPlan.id);

  // Track applied changes for reporting
  const applied: string[] = [];
  const warnings: string[] = [];

  // Deep copy each day
  for (const sourceDay of sourceDays) {
    const dayKey = (sourceDay.day_label || '').toLowerCase();
    const dayUpdates = dayChangeMap.get(dayKey) || {};

    const { data: newDay } = await sb
      .from('plan_days')
      .insert({
        plan_id: targetPlan.id,
        day_index: sourceDay.day_index,
        day_label: dayUpdates.day_label || sourceDay.day_label,
        title: dayUpdates.title ?? sourceDay.title,
        day_type: dayUpdates.day_type ?? sourceDay.day_type,
        duration: dayUpdates.duration ?? sourceDay.duration,
        is_rest_day: dayUpdates.is_rest_day ?? sourceDay.is_rest_day,
        rest_message: dayUpdates.rest_message ?? sourceDay.rest_message,
        rest_icon: dayUpdates.rest_icon ?? sourceDay.rest_icon,
        sort_order: sourceDay.sort_order,
      })
      .select()
      .single();

    if (!newDay) continue;
    if (Object.keys(dayUpdates).length > 0) {
      applied.push(`Updated ${sourceDay.day_label} day fields`);
    }

    const daySections = sectionsByDay.get(sourceDay.id) || [];
    const dayExChanges = exerciseChangesByDay.get(dayKey) || [];

    // Track which changes were applied so we can warn about unmatched ones
    const appliedChangeIndices = new Set<number>();

    for (const sourceSection of daySections) {
      const { data: newSection } = await sb
        .from('plan_sections')
        .insert({
          day_id: newDay.id,
          label: sourceSection.label,
          sort_order: sourceSection.sort_order,
        })
        .select()
        .single();

      if (!newSection) continue;

      const sectionExercises = exercisesBySection.get(sourceSection.id) || [];

      for (const sourceEx of sectionExercises) {
        // Check for update or remove changes matching this exercise
        const changeIdx = dayExChanges.findIndex((c, i) =>
          !appliedChangeIndices.has(i) &&
          c.exercise &&
          c.exercise.toLowerCase() === (sourceEx.name || '').toLowerCase() &&
          !c.add
        );

        if (changeIdx >= 0) {
          const change = dayExChanges[changeIdx];
          appliedChangeIndices.add(changeIdx);

          if (change.remove) {
            applied.push(`Removed "${sourceEx.name}" from ${sourceDay.day_label}`);
            continue; // skip inserting this exercise
          }

          if (change.update) {
            // Insert with merged updates
            const allowedFields = ['name', 'detail', 'note', 'description', 'exercise_type', 'input_config', 'is_rainier'];
            const merged: any = {};
            for (const field of allowedFields) {
              merged[field] = change.update[field] !== undefined ? change.update[field] : sourceEx[field];
            }

            await sb.from('plan_exercises').insert({
              section_id: newSection.id,
              name: merged.name,
              detail: merged.detail,
              note: merged.note,
              description: merged.description,
              exercise_type: merged.exercise_type,
              input_config: merged.input_config,
              is_rainier: merged.is_rainier,
              sort_order: sourceEx.sort_order,
            });

            applied.push(`Updated "${sourceEx.name}" in ${sourceDay.day_label}: ${Object.keys(change.update).join(', ')}`);
            continue;
          }
        }

        // No change — copy as-is
        await sb.from('plan_exercises').insert({
          section_id: newSection.id,
          name: sourceEx.name,
          detail: sourceEx.detail,
          note: sourceEx.note,
          description: sourceEx.description,
          exercise_type: sourceEx.exercise_type,
          input_config: sourceEx.input_config,
          is_rainier: sourceEx.is_rainier,
          sort_order: sourceEx.sort_order,
        });
      }

      // Handle add operations for this section
      for (let i = 0; i < dayExChanges.length; i++) {
        if (appliedChangeIndices.has(i)) continue;
        const change = dayExChanges[i];
        if (!change.add) continue;
        if (!change.section || change.section.toLowerCase() !== sourceSection.label.toLowerCase()) continue;

        appliedChangeIndices.add(i);

        // Get next sort_order
        const { data: existing } = await sb
          .from('plan_exercises')
          .select('sort_order')
          .eq('section_id', newSection.id)
          .order('sort_order', { ascending: false })
          .limit(1);

        const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

        await sb.from('plan_exercises').insert({
          section_id: newSection.id,
          name: change.add.name,
          detail: change.add.detail || null,
          note: change.add.note || null,
          description: change.add.description || null,
          exercise_type: change.add.exercise_type || 'fields',
          input_config: change.add.input_config || {},
          is_rainier: change.add.is_rainier || false,
          sort_order: nextOrder,
        });

        applied.push(`Added "${change.add.name}" to ${sourceDay.day_label} > ${sourceSection.label}`);
      }
    }

    // Warn about unmatched changes for this day
    for (let i = 0; i < dayExChanges.length; i++) {
      if (!appliedChangeIndices.has(i)) {
        const c = dayExChanges[i];
        const target = c.exercise || c.add?.name || 'unknown';
        warnings.push(`Could not match change for "${target}" in ${sourceDay.day_label}`);
      }
    }
  }

  return {
    success: true,
    plan_id: targetPlan.id,
    source_week: input.source_week,
    target_week: input.target_week,
    changes_applied: applied,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
