import { signal } from '@preact/signals';
import { currentUser, currentWeek, currentPlan, exerciseLogs, dayCheckIns, navigate, signOut } from '../lib/state.js';
import { getWeeksForUser, getPlanForWeek, getExerciseLogs, getDayCheckIns } from '../lib/supabase.js';
import { showToast } from '../components/Toast.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

const weeks = signal([]);
const loading = signal(false);

export function WeekSelect() {
  const user = currentUser.value;

  // Load weeks when component renders
  if (user && weeks.value.length === 0 && !loading.value) {
    loading.value = true;
    getWeeksForUser(user.id).then(w => {
      weeks.value = w;
      loading.value = false;
    });
  }

  async function openWeek(week) {
    showToast('Loading…');
    currentWeek.value = week;

    const planData = await getPlanForWeek(user.id, week.week_number);
    currentPlan.value = planData;

    // Load existing logs
    const logs = await getExerciseLogs(user.id, week.week_number);
    const logMap = {};
    logs.forEach(l => { logMap[l.plan_exercise_id] = l; });
    exerciseLogs.value = logMap;

    const checkIns = await getDayCheckIns(user.id, week.week_number);
    const checkInMap = {};
    checkIns.forEach(c => { checkInMap[c.plan_day_id] = c; });
    dayCheckIns.value = checkInMap;

    navigate('tracker');
    showToast('Loaded ✓');
  }

  return (
    <div class="week-screen">
      <div class="week-topbar">
        <div>
          <h1>{user?.avatar_emoji} {user?.display_name}</h1>
          <p>Select a week to log</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <ThemeToggle />
          <button class="week-signout" onClick={() => { weeks.value = []; signOut(); }}>Sign out</button>
        </div>
      </div>
      <div class="week-list">
        {weeks.value.map(w => (
          <button key={w.id} class="week-item" onClick={() => openWeek(w)}>
            <div class="week-num">{w.week_number}</div>
            <div class="week-info">
              <h3>{w.week_label}</h3>
              <p>{w.week_subtitle}</p>
            </div>
            <span class="week-arrow">›</span>
          </button>
        ))}
        {loading.value && <p style="text-align:center;color:var(--text-secondary);padding:20px">Loading weeks…</p>}
        {!loading.value && weeks.value.length === 0 && <p style="text-align:center;color:var(--text-secondary);padding:20px">No weeks found. Ask Claude to generate one!</p>}
      </div>
    </div>
  );
}
