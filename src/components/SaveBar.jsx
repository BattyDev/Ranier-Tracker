import { currentDay, currentPlan, saveStatus } from '../lib/state.js';

export function SaveBar({ onSave }) {
  const plan = currentPlan.value;
  const maxDay = plan ? plan.days.length : 0; // days.length = summary tab index

  function prev() {
    if (currentDay.value > 0) currentDay.value = currentDay.value - 1;
  }

  function next() {
    if (currentDay.value < maxDay) currentDay.value = currentDay.value + 1;
  }

  return (
    <div class="save-bar">
      <div class="nav-arrows">
        <button class="nav-arrow" onClick={prev}>←</button>
        <button class="nav-arrow" onClick={next}>→</button>
      </div>
      <span class="last-saved">{saveStatus.value || 'Not yet saved'}</span>
      <button class="save-btn-manual" onClick={onSave}>Save</button>
    </div>
  );
}
