// ═══════════════════════════════════════════
// CODY TRACKER LOGIC
// ═══════════════════════════════════════════

const setExercises = ['mon-1','mon-2','mon-3','mon-4','thu-1','thu-2','thu-3','thu-4','thu-5','thu-6','sat-0','sat-1','sat-2'];
const setCount = {'mon-1':3,'mon-2':3,'mon-3':3,'mon-4':3,'thu-1':3,'thu-2':3,'thu-3':3,'thu-4':3,'thu-5':2,'thu-6':2,'sat-0':3,'sat-1':3,'sat-2':3};
const feelOpts = ['Easy','Moderate','Hard','Max'];
const painDays = ['mon','tue','wed','thu','fri','sat','sun'];

function initCodySetRows() {
  setExercises.forEach(id => {
    const container = document.getElementById('sets-' + id);
    if (!container || container.children.length > 0) return;
    const n = setCount[id] || 3;
    for (let i = 1; i <= n; i++) {
      const row = document.createElement('div');
      row.className = 'set-input-row';
      row.innerHTML = `
        <span class="set-num">S${i}</span>
        <input type="number" inputmode="decimal" placeholder="—" id="${id}-w${i}" oninput="autoSave()">
        <input type="number" inputmode="numeric" placeholder="—" id="${id}-r${i}" oninput="autoSave()">
        <select id="${id}-f${i}" style="background:#1e2421;border:1px solid rgba(255,255,255,0.12);color:#e8ede9;font-family:'DM Mono',monospace;font-size:16px;padding:11px 4px;border-radius:8px;width:100%;min-height:44px;-webkit-appearance:none;" onchange="autoSave()">
          ${feelOpts.map(o=>`<option>${o}</option>`).join('')}
        </select>`;
      container.appendChild(row);
    }
  });
}

function initPainScales() {
  painDays.forEach(day => {
    const container = document.getElementById('pain-' + day);
    if (!container || container.children.length > 0) return;
    for (let i = 0; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.className = 'pain-btn';
      btn.textContent = i;
      btn.onclick = () => selectPain(day, i, btn);
      container.appendChild(btn);
    }
  });
}

function selectPain(day, val, btn) {
  const container = document.getElementById('pain-' + day);
  container.querySelectorAll('.pain-btn').forEach(b => b.className = 'pain-btn');
  codyPainSelections[day] = val;
  let cls = 'sel-green';
  if (val >= 4 && val <= 6) cls = 'sel-yellow';
  if (val > 6) cls = 'sel-red';
  btn.className = 'pain-btn ' + cls;
  autoSave();
}

function restoreCodyUI() {
  initCodySetRows();
  initPainScales();
  const d = codyState;
  // Restore all inputs
  const allInputs = document.querySelectorAll('#screen-cody input, #screen-cody textarea, #screen-cody select');
  allInputs.forEach(el => {
    if (el.id && d[el.id] !== undefined) {
      el.value = d[el.id];
    }
  });
  // Restore logged exercises
  codyLoggedExercises.forEach(id => {
    const card = document.getElementById('ex-' + id);
    if (card) card.classList.add('logged');
  });
  // Restore pain
  Object.entries(codyPainSelections).forEach(([day, val]) => {
    const container = document.getElementById('pain-' + day);
    if (!container) return;
    const btns = container.querySelectorAll('.pain-btn');
    btns.forEach(b => b.className = 'pain-btn');
    if (btns[val]) {
      let cls = 'sel-green';
      if (val >= 4 && val <= 6) cls = 'sel-yellow';
      if (val > 6) cls = 'sel-red';
      btns[val].className = 'pain-btn ' + cls;
    }
  });
}

function collectCodyState() {
  const state = {};
  const allInputs = document.querySelectorAll('#screen-cody input, #screen-cody textarea, #screen-cody select');
  allInputs.forEach(el => {
    if (el.id) state[el.id] = el.value;
  });
  state._pain = codyPainSelections;
  state._logged = [...codyLoggedExercises];
  return state;
}

function toggleEx(id) {
  const log = document.getElementById('log-' + id);
  const chev = document.getElementById('chev-' + id);
  if (log) log.classList.toggle('open');
  if (chev) chev.classList.toggle('open');
}

function markDone(id) {
  const card = document.getElementById('ex-' + id);
  if (card) card.classList.add('logged');
  codyLoggedExercises.add(id);
  const log = document.getElementById('log-' + id);
  const chev = document.getElementById('chev-' + id);
  if (log) log.classList.remove('open');
  if (chev) chev.classList.remove('open');
  showToast('Logged ✓', 'cody');
  autoSave();
}

function showDay(idx) {
  document.querySelectorAll('.c-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page' + idx)?.classList.add('active');
  document.querySelectorAll('.tab-btn')[idx]?.classList.add('active');
  currentDay = idx;
  if (idx === 7) updateSummary();
}

function updateSummary() {
  const trainDays = ['mon','tue','thu','sat'];
  let sessionsLogged = 0;
  trainDays.forEach(d => {
    if ([...codyLoggedExercises].some(e => e.startsWith(d))) sessionsLogged++;
  });
  document.getElementById('sum-sessions').textContent = sessionsLogged + ' / 4';
  document.getElementById('sum-exercises').textContent = codyLoggedExercises.size;
  const painVals = Object.values(codyPainSelections);
  if (painVals.length > 0) {
    document.getElementById('sum-pain').textContent = (painVals.reduce((a,b)=>a+b,0)/painVals.length).toFixed(1) + ' / 10';
  }
  const w = document.getElementById('sun-weight')?.value;
  document.getElementById('sum-weight').textContent = w ? w + ' lbs' : '—';
  const rDur = document.getElementById('sat-inc-dur')?.value;
  const rInc = document.getElementById('sat-inc-pct')?.value;
  if (rDur && rInc) document.getElementById('sum-rainier').textContent = rDur + ' min @ ' + rInc + '% incline';
}

function getVal(id) { const el = document.getElementById(id); return el ? (el.value || '—') : '—'; }

function generateMarkdown() {
  updateSummary();
  const lines = ['# Week 1 — Cody Training Log', '', '---', ''];
  lines.push('## Monday — Lower body + Core');
  lines.push('Warm-up: ' + getVal('mon-0-dur') + ' min @ ' + getVal('mon-0-inc') + '% incline');
  lines.push('Sciatica: ' + (codyPainSelections['mon'] ?? '—') + '/10'); lines.push('');
  lines.push('## Tuesday — Cardio + Mobility');
  lines.push(getVal('tue-cardio-type') + ': ' + getVal('tue-dur') + ' min | ' + getVal('tue-dist') + ' miles');
  lines.push('Sciatica: ' + (codyPainSelections['tue'] ?? '—') + '/10'); lines.push('');
  lines.push('## Thursday — Upper body + Core');
  lines.push('Warmup row: ' + getVal('thu-0-dur') + ' min @ resistance ' + getVal('thu-0-res'));
  lines.push('Sciatica: ' + (codyPainSelections['thu'] ?? '—') + '/10'); lines.push('');
  lines.push('## Saturday — Rainier prep');
  lines.push('⛰ Incline: ' + getVal('sat-inc-dur') + ' min @ ' + getVal('sat-inc-pct') + '% | ' + getVal('sat-inc-spd') + ' mph | Effort: ' + getVal('sat-inc-feel') + '/10');
  lines.push('Sciatica: ' + (codyPainSelections['sat'] ?? '—') + '/10'); lines.push('');
  lines.push('## Sunday weight: ' + getVal('sun-weight') + ' lbs');
  const md = lines.join('\n');
  document.getElementById('md-preview').textContent = md;
  document.getElementById('md-preview').classList.add('open');
  window._codyMd = md;
  showToast('Markdown ready!', 'cody');
}

function copyMarkdown() {
  if (!window._codyMd) { generateMarkdown(); return; }
  navigator.clipboard.writeText(window._codyMd).then(() => showToast('Copied!', 'cody'));
}
