import { currentUser, currentWeek, goToWeeks } from '../lib/state.js';
import { ThemeToggle } from './ThemeToggle.jsx';

export function TopBar() {
  const user = currentUser.value;
  const week = currentWeek.value;

  return (
    <div class="topbar">
      <div class="topbar-left">
        <h1>{user?.avatar_emoji} {user?.display_name}</h1>
        <span>{week?.week_label} · {week?.week_subtitle}</span>
      </div>
      <div class="topbar-right">
        <div class="summit-pill">Aug 2026</div>
        <ThemeToggle />
        <button class="topbar-btn" onClick={goToWeeks}>← Weeks</button>
      </div>
    </div>
  );
}
