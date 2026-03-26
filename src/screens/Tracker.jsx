import { currentUser, currentWeek, currentPlan, currentDay, exerciseLogs, dayCheckIns, isDemoMode, saveStatus, isSaving } from '../lib/state.js';
import { upsertExerciseLog, upsertDayCheckIn } from '../lib/supabase.js';
import { TopBar } from '../components/TopBar.jsx';
import { DayTabs } from '../components/DayTabs.jsx';
import { ExerciseCard } from '../components/ExerciseCard.jsx';
import { RestDayCard } from '../components/RestDayCard.jsx';
import { CheckInWidget } from '../components/CheckInWidget.jsx';
import { SaveBar } from '../components/SaveBar.jsx';
import { Summary } from './Summary.jsx';
import { Toast } from '../components/Toast.jsx';
import { showToast } from '../components/Toast.jsx';

let saveTimer = null;

function scheduleSave() {
  if (isDemoMode.value) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 1500);
}

async function flushSave() {
  if (isDemoMode.value || isSaving.value) return;
  isSaving.value = true;
  saveStatus.value = 'Saving…';

  const user = currentUser.value;
  const week = currentWeek.value;
  if (!user || !week) { isSaving.value = false; return; }

  try {
    // Save all dirty exercise logs
    const logs = exerciseLogs.value;
    for (const [exId, log] of Object.entries(logs)) {
      if (log._dirty) {
        const { _dirty, ...cleanLog } = log;
        await upsertExerciseLog({
          ...cleanLog,
          user_id: user.id,
          plan_exercise_id: exId,
          week_number: week.week_number,
          updated_at: new Date().toISOString(),
        });
        logs[exId] = cleanLog;
      }
    }
    exerciseLogs.value = { ...logs };

    // Save all dirty check-ins
    const checkIns = dayCheckIns.value;
    for (const [dayId, ci] of Object.entries(checkIns)) {
      if (ci._dirty) {
        const { _dirty, ...cleanCI } = ci;
        await upsertDayCheckIn({
          ...cleanCI,
          user_id: user.id,
          plan_day_id: dayId,
          week_number: week.week_number,
          updated_at: new Date().toISOString(),
        });
        checkIns[dayId] = cleanCI;
      }
    }
    dayCheckIns.value = { ...checkIns };

    const t = new Date();
    saveStatus.value = `Saved ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    console.error('Save error:', e);
    saveStatus.value = 'Save failed — check connection';
  }
  isSaving.value = false;
}

function getDayTagClass(dayType) {
  switch (dayType) {
    case 'strength': return 'tag-strength';
    case 'cardio': return 'tag-cardio';
    case 'rest': case 'recovery': return 'tag-rest';
    case 'rainier': return 'tag-rainier';
    default: return 'tag-rest';
  }
}

export function Tracker() {
  const plan = currentPlan.value;
  if (!plan) return null;

  const dayIdx = currentDay.value;
  const days = plan.days;
  const isSummary = dayIdx >= days.length;
  const day = !isSummary ? days[dayIdx] : null;

  // Get sections and exercises for current day
  const daySections = day ? plan.sections.filter(s => s.day_id === day.id).sort((a, b) => a.sort_order - b.sort_order) : [];
  const dayExercises = day ? plan.exercises.filter(e => daySections.some(s => s.id === e.section_id)) : [];

  function handleLogChange(exerciseId, newLoggedData) {
    const logs = { ...exerciseLogs.value };
    const existing = logs[exerciseId] || {};
    logs[exerciseId] = {
      ...existing,
      logged_data: newLoggedData,
      plan_day_id: day?.id,
      _dirty: true,
    };
    exerciseLogs.value = logs;
    scheduleSave();
  }

  function handleMarkDone(exerciseId) {
    const logs = { ...exerciseLogs.value };
    const existing = logs[exerciseId] || {};
    logs[exerciseId] = {
      ...existing,
      plan_day_id: day?.id,
      is_completed: true,
      completed_at: new Date().toISOString(),
      _dirty: true,
    };
    exerciseLogs.value = logs;
    showToast('Logged ✓');
    scheduleSave();
  }

  function handlePainChange(score) {
    if (!day) return;
    const checkIns = { ...dayCheckIns.value };
    const existing = checkIns[day.id] || {};
    checkIns[day.id] = { ...existing, pain_score: score, _dirty: true };
    dayCheckIns.value = checkIns;
    scheduleSave();
  }

  function handleFeelingChange(feeling) {
    if (!day) return;
    const checkIns = { ...dayCheckIns.value };
    const existing = checkIns[day.id] || {};
    checkIns[day.id] = { ...existing, feeling, _dirty: true };
    dayCheckIns.value = checkIns;
    scheduleSave();
  }

  return (
    <div>
      {isDemoMode.value && (
        <div class="demo-banner">
          <div class="demo-dot" /> DEMO MODE — changes are not saved
        </div>
      )}
      <TopBar />
      <DayTabs />

      {isSummary ? (
        <Summary />
      ) : day?.is_rest_day ? (
        <div class="day-page">
          <div class="day-header">
            <h2>{day.day_label}</h2>
            <div class="day-meta">
              <span class={`day-tag ${getDayTagClass(day.day_type)}`}>{day.title}</span>
            </div>
          </div>
          <RestDayCard
            day={day}
            exercises={dayExercises}
            logData={exerciseLogs.value}
            onLogChange={handleLogChange}
          />
          <div class="section-lbl">Session check-in</div>
          <CheckInWidget
            checkIn={dayCheckIns.value[day.id]}
            onPainChange={handlePainChange}
            onFeelingChange={handleFeelingChange}
          />
        </div>
      ) : (
        <div class="day-page">
          <div class="day-header">
            <h2>{day.day_label}</h2>
            <div class="day-meta">
              {day.title && <span class={`day-tag ${getDayTagClass(day.day_type)}`}>{day.title.split('+').map(t => t.trim()).join(' · ')}</span>}
              {day.duration && <span class="day-tag tag-rest">{day.duration}</span>}
            </div>
          </div>

          {daySections.map(section => {
            const sectionExercises = plan.exercises
              .filter(e => e.section_id === section.id)
              .sort((a, b) => a.sort_order - b.sort_order);

            if (section.label.toLowerCase().includes('check-in')) return null;

            return (
              <div key={section.id}>
                <div class="section-lbl">{section.label}</div>
                {sectionExercises.map(ex => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    logData={exerciseLogs.value[ex.id]}
                    onLogChange={handleLogChange}
                    onMarkDone={handleMarkDone}
                  />
                ))}
              </div>
            );
          })}

          <div class="section-lbl">Session check-in</div>
          <CheckInWidget
            checkIn={dayCheckIns.value[day.id]}
            onPainChange={handlePainChange}
            onFeelingChange={handleFeelingChange}
          />
        </div>
      )}

      <SaveBar onSave={flushSave} />
      <Toast />
    </div>
  );
}
