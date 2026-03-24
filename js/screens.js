// ═══════════════════════════════════════════
// SCREEN MANAGEMENT, NAVIGATION & PIN
// ═══════════════════════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

// ── LANDING ──
function selectUser(user) {
  activeUser = user;
  const pinScreen = document.getElementById('screen-pin');
  pinScreen.className = `screen theme-${user}`;
  document.getElementById('pinUserLabel').textContent = user.toUpperCase();
  document.getElementById('pinTitle').textContent = 'Enter your PIN';
  document.getElementById('pinHint').textContent = '6-digit code';
  resetPinUI();
  showScreen('pin');
}

// ── PIN ──
function resetPinUI() {
  pinBuffer = '';
  document.getElementById('pinError').classList.remove('show');
  updatePinDots();
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('filled', i < pinBuffer.length);
  });
}

function pinPress(digit) {
  if (pinBuffer.length >= 6) return;
  pinBuffer += digit;
  updatePinDots();
  if (pinBuffer.length === 6) {
    setTimeout(checkPin, 100);
  }
}

function pinDel() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
}

function pinClear() {
  pinBuffer = '';
  updatePinDots();
}

function checkPin() {
  const correctPin = PINS[activeUser];
  const isDemo = pinBuffer === PINS.demo;
  if (pinBuffer === correctPin || isDemo) {
    isDemoMode = isDemo;
    document.getElementById('pinError').classList.remove('show');
    loadAndGoToWeeks();
  } else {
    document.getElementById('pinError').classList.add('show');
    const dots = document.getElementById('pinDots');
    dots.style.animation = 'none';
    dots.offsetHeight;
    dots.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      pinBuffer = '';
      updatePinDots();
    }, 600);
  }
}

async function loadAndGoToWeeks() {
  showScreen('weeks');
  const ws = document.getElementById('screen-weeks');
  ws.className = `screen active week-theme-${activeUser}`;
  document.getElementById('weekTopbarTitle').textContent = activeUser === 'cody' ? 'Cody' : 'Kylie';
  document.getElementById('weekTopbarSub').textContent = isDemoMode ? '👁 Demo mode — no data saved' : 'Select a week to log';
  renderWeekList();
}

function goBack() {
  resetPinUI();
  showScreen('landing');
}

function signOut() {
  activeUser = null;
  activeWeek = 'week1';
  isDemoMode = false;
  showScreen('landing');
}

function goToWeeks() {
  showScreen('weeks');
}
