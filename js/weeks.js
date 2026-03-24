// ═══════════════════════════════════════════
// WEEK LIST — selection & loading
// ═══════════════════════════════════════════

const WEEKS = [
  { id: 'week1', label: 'Week 1', sub: 'Baseline · Mar 24–30' }
  // Add more weeks here as you build them
];

function renderWeekList() {
  const container = document.getElementById('weekList');
  container.innerHTML = WEEKS.map(w => `
    <button class="week-item" onclick="openWeek('${w.id}')">
      <div class="week-num">${w.id.replace('week','')}</div>
      <div class="week-info">
        <h3>${w.label}</h3>
        <p>${w.sub}</p>
      </div>
      <span class="week-arrow">›</span>
    </button>
  `).join('');
}

async function openWeek(weekId) {
  activeWeek = weekId;
  if (!isDemoMode) showToast('Loading…');
  if (activeUser === 'cody') {
    codyState = isDemoMode ? {} : (await loadData('cody', weekId) || {});
    codyPainSelections = codyState._pain || {};
    codyLoggedExercises = new Set(codyState._logged || []);
    restoreCodyUI();
    showScreen('cody');
    showDay(0);
  } else {
    kylieState = isDemoMode ? {} : (await loadData('kylie', weekId) || {});
    kOpenDay = kylieState._open || null;
    renderKylieUI();
    showScreen('kylie');
  }
  // Show/hide demo banners
  document.querySelectorAll('.demo-banner').forEach(el => {
    el.style.display = isDemoMode ? 'flex' : 'none';
  });
  // Update save bar text in demo mode
  if (isDemoMode) {
    document.getElementById('lastSavedCody').textContent = '👁 Demo mode — not saving';
    document.getElementById('lastSavedKylie').textContent = '👁 Demo mode — not saving';
  }
  if (!isDemoMode) showToast('Loaded ✓', activeUser);
}
