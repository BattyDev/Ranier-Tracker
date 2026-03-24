// ═══════════════════════════════════════════
// APP — Auto-save, toast, initialization
// ═══════════════════════════════════════════

// ── AUTO-SAVE ──
function autoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(doSave, 1500);
}

async function doSave() {
  if (!activeUser || !activeWeek) return;
  if (isDemoMode) return;
  let data;
  if (activeUser === 'cody') {
    data = collectCodyState();
    codyState = data;
  } else {
    kylieState._open = kOpenDay;
    data = kylieState;
  }
  await saveData(activeUser, activeWeek, data);
}

async function manualSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  if (isDemoMode) { showToast('Demo mode — nothing saved', activeUser); return; }
  await doSave();
  showToast('Saved ✓', activeUser || 'cody');
}

// ── TOAST ──
function showToast(msg, user) {
  const t = document.getElementById('toast');
  const isKylie = (user || activeUser) === 'kylie';
  t.className = `toast ${isKylie ? 'toast-kylie' : 'toast-cody'}`;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ── INIT ──
initCodySetRows();
initPainScales();
