import { selectedUser, navigate } from '../lib/state.js';
import { getUsers } from '../lib/supabase.js';
import { signal } from '@preact/signals';

const users = signal([]);
const loaded = signal(false);

export function Landing() {
  // Load users on first render
  if (!loaded.value) {
    loaded.value = true;
    getUsers().then(u => { users.value = u; });
  }

  function selectUser(name) {
    selectedUser.value = name;
    navigate('pin');
  }

  return (
    <div class="landing">
      <div class="landing-badge">⛰ Mt. Rainier · Aug 2026</div>
      <h1 class="landing-title">Training<br />Tracker</h1>
      <p class="landing-sub">Choose your profile<br />to log your progress</p>
      <div class="user-cards">
        {users.value.map(u => (
          <button key={u.id} class="user-card" onClick={() => selectUser(u.name)}>
            <div class="user-avatar">{u.avatar_emoji}</div>
            <div class="user-card-info">
              <h3>{u.display_name}</h3>
              <p>{u.goal_summary?.split('·').slice(1).join('·').trim() || ''}</p>
            </div>
            <span class="user-card-arrow">→</span>
          </button>
        ))}
      </div>
      <p class="landing-footer">Protected with 6-digit PIN</p>
    </div>
  );
}
