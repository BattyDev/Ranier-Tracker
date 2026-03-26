import { currentPlan, exerciseLogs, dayCheckIns } from '../lib/state.js';

export function Summary() {
  const plan = currentPlan.value;
  if (!plan) return null;

  const logs = exerciseLogs.value;
  const checkIns = dayCheckIns.value;

  // Sessions logged — count days with at least one completed exercise
  const trainingDays = plan.days.filter(d => !d.is_rest_day);
  let sessionsLogged = 0;
  trainingDays.forEach(day => {
    const dayExercises = plan.exercises.filter(e => {
      const section = plan.sections.find(s => s.id === e.section_id);
      return section?.day_id === day.id;
    });
    const hasCompleted = dayExercises.some(e => logs[e.id]?.is_completed);
    if (hasCompleted) sessionsLogged++;
  });

  // Total exercises completed
  const totalCompleted = Object.values(logs).filter(l => l.is_completed).length;

  // Average pain score
  const painScores = Object.values(checkIns).filter(c => c.pain_score != null).map(c => c.pain_score);
  const avgPain = painScores.length > 0
    ? (painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)
    : null;

  // Weight (from Sunday check-in extra_data or exercise logs with weight field)
  let weight = null;
  const sundayDay = plan.days.find(d => d.day_label === 'Sunday');
  if (sundayDay) {
    const sundayExercises = plan.exercises.filter(e => {
      const section = plan.sections.find(s => s.id === e.section_id);
      return section?.day_id === sundayDay.id;
    });
    const weightEx = sundayExercises.find(e => e.name?.toLowerCase().includes('weight'));
    if (weightEx && logs[weightEx.id]?.logged_data?.weight) {
      weight = logs[weightEx.id].logged_data.weight;
    }
  }

  // Rainier incline stats
  let rainierStats = null;
  const rainierExercise = plan.exercises.find(e => e.is_rainier && e.input_config?.fields?.some(f => f.key === 'incline'));
  if (rainierExercise && logs[rainierExercise.id]?.logged_data) {
    const rd = logs[rainierExercise.id].logged_data;
    if (rd.duration && rd.incline) {
      rainierStats = `${rd.duration} min @ ${rd.incline}% incline`;
    }
  }

  return (
    <div class="day-page">
      <div class="day-header">
        <h2>{plan.plan.week_label} Summary</h2>
        <div class="day-meta">
          <span class="day-tag tag-cardio">Progress report</span>
        </div>
      </div>

      <div class="summary-card">
        <h3>Week at a glance</h3>
        <div class="stat-row">
          <span class="stat-label">Sessions logged</span>
          <span class="stat-val green">{sessionsLogged} / {trainingDays.length}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Exercises completed</span>
          <span class="stat-val">{totalCompleted}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg sciatica score</span>
          <span class="stat-val">{avgPain !== null ? `${avgPain} / 10` : '—'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Sunday weight</span>
          <span class="stat-val">{weight ? `${weight} lbs` : '—'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Rainier incline done</span>
          <span class="stat-val">{rainierStats || '—'}</span>
        </div>
      </div>
    </div>
  );
}
