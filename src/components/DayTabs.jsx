import { currentDay, currentPlan } from '../lib/state.js';

export function DayTabs() {
  const plan = currentPlan.value;
  if (!plan) return null;

  const days = plan.days;
  const active = currentDay.value;

  return (
    <div class="nav-tabs">
      {days.map((day, i) => (
        <button
          key={day.id}
          class={`tab-btn ${i === active ? 'active' : ''} ${day.is_rest_day ? 'rest-tab' : ''}`}
          onClick={() => { currentDay.value = i; }}
        >
          {day.day_label.slice(0, 3)}
        </button>
      ))}
      <button
        class={`tab-btn summary-tab ${active === days.length ? 'active' : ''}`}
        onClick={() => { currentDay.value = days.length; }}
      >
        Summary
      </button>
    </div>
  );
}
