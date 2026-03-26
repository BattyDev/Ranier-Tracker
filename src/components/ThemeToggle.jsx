import { theme, toggleTheme } from '../lib/state.js';

export function ThemeToggle() {
  return (
    <button class="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {theme.value === 'dark' ? '☀' : '🌙'}
    </button>
  );
}
