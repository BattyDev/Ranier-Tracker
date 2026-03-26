import { signal } from '@preact/signals';
import { selectedUser, currentUser, navigate, isDemoMode } from '../lib/state.js';
import { getUserByPin, getUsers } from '../lib/supabase.js';

const pinBuffer = signal('');
const error = signal(false);

const DEMO_PIN = '101010';

export function PinEntry() {
  const userName = selectedUser.value;

  function goBack() {
    pinBuffer.value = '';
    error.value = false;
    navigate('landing');
  }

  async function checkPin(pin) {
    if (pin === DEMO_PIN) {
      // Demo mode
      const users = await getUsers();
      const u = users.find(u => u.name === userName);
      if (u) {
        currentUser.value = u;
        isDemoMode.value = true;
        navigate('weeks');
      }
      pinBuffer.value = '';
      return;
    }

    const user = await getUserByPin(pin);
    if (user && user.name === userName) {
      currentUser.value = user;
      isDemoMode.value = false;
      pinBuffer.value = '';
      error.value = false;
      navigate('weeks');
    } else {
      error.value = true;
      pinBuffer.value = '';
      setTimeout(() => { error.value = false; }, 2000);
    }
  }

  function press(digit) {
    if (pinBuffer.value.length >= 6) return;
    const newPin = pinBuffer.value + digit;
    pinBuffer.value = newPin;
    if (newPin.length === 6) {
      checkPin(newPin);
    }
  }

  function del() {
    pinBuffer.value = pinBuffer.value.slice(0, -1);
  }

  function clear() {
    pinBuffer.value = '';
  }

  const dots = Array.from({ length: 6 }, (_, i) => i < pinBuffer.value.length);

  return (
    <div class="pin-screen">
      <button class="pin-back" onClick={goBack}>← Back</button>
      <div class="pin-user-label">{userName?.toUpperCase()}</div>
      <h2 class="pin-title">Enter your PIN</h2>
      <p class="pin-hint">6-digit code</p>
      <div class="pin-dots">
        {dots.map((filled, i) => (
          <div key={i} class={`pin-dot ${filled ? 'filled' : ''}`} />
        ))}
      </div>
      <div class={`pin-error ${error.value ? 'show' : ''}`}>Incorrect PIN. Try again.</div>
      <div class="pin-keypad">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} class="pin-key" onClick={() => press(String(n))}>
            <span class="pin-key-num">{n}</span>
            <span class="pin-key-sub">{['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'][n-1] || '\u00A0'}</span>
          </button>
        ))}
        <button class="pin-key del" onClick={clear}>⌫ Clear</button>
        <button class="pin-key" onClick={() => press('0')}>
          <span class="pin-key-num">0</span>
          <span class="pin-key-sub">+</span>
        </button>
        <button class="pin-key del" onClick={del}>⌫</button>
      </div>
    </div>
  );
}
