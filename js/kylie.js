// ═══════════════════════════════════════════
// KYLIE TRACKER LOGIC
// ═══════════════════════════════════════════

const KYLIE_DAYS = [
  {
    id: 'tue', label: 'Tue', fullDay: 'Tue Mar 24', title: 'Lower body strength',
    accent: 'k-accent-strength', type: 'Strength', duration: '~55 min',
    exercises: [
      { name: 'Treadmill warm-up — incline 2–3%', target: '10 min', rainier: true, fields: [{key:'duration',label:'min',ph:'10'},{key:'incline',label:'%',ph:'3'}] },
      { name: 'Leg press machine', target: '3 sets × 12 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Goblet squat', target: '3 sets × 12 reps', rainier: true, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Seated leg curl machine', target: '3 sets × 12 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Standing calf raises', target: '3 sets × 15 reps', rainier: true, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Hip abductor machine', target: '2 sets × 15 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'}] },
      { name: 'Cool-down stretch', target: '5–8 min', rainier: false, fields: [{key:'notes',label:'notes',ph:"How did it feel?",isNote:true}] }
    ]
  },
  {
    id: 'thu', label: 'Thu', fullDay: 'Thu Mar 26', title: 'Cardio endurance',
    accent: 'k-accent-cardio', type: 'Cardio', duration: '~50 min',
    exercises: [
      { name: 'Treadmill incline intervals (2 min flat / 2 min at 4–6%)', target: '35 min', rainier: true, fields: [{key:'duration',label:'min',ph:'35'},{key:'max_inc',label:'max %',ph:'6'},{key:'speed',label:'mph',ph:'3.5'}] },
      { name: 'OR: Outdoor walk (brisk, hilly route)', target: '35 min', rainier: true, fields: [{key:'duration',label:'min',ph:'35'},{key:'miles',label:'mi',ph:'1.5'}] },
      { name: 'Stationary bike cool-down', target: '10 min', rainier: false, fields: [{key:'duration',label:'min',ph:'10'}] },
      { name: 'Foam rolling — quads, IT band, calves', target: '5 min', rainier: false, fields: [{key:'notes',label:'notes',ph:'Anything tight?',isNote:true}] }
    ]
  },
  {
    id: 'sat', label: 'Sat', fullDay: 'Sat Mar 28', title: 'Upper body + core',
    accent: 'k-accent-strength', type: 'Strength', duration: '~55 min',
    exercises: [
      { name: 'Elliptical warm-up — easy pace', target: '8 min', rainier: false, fields: [{key:'duration',label:'min',ph:'8'}] },
      { name: 'Seated cable row', target: '3 sets × 12 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Dumbbell shoulder press', target: '3 sets × 12 reps', rainier: true, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Lat pulldown machine', target: '3 sets × 12 reps', rainier: true, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'},{key:'s3',label:'Set 3',ph:'lbs'}] },
      { name: 'Dumbbell bicep curl', target: '2 sets × 12 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'}] },
      { name: 'Tricep pushdown — cable', target: '2 sets × 12 reps', rainier: false, fields: [{key:'s1',label:'Set 1',ph:'lbs'},{key:'s2',label:'Set 2',ph:'lbs'}] },
      { name: 'Plank hold', target: '3 × 20–30 sec', rainier: true, fields: [{key:'s1',label:'Set 1',ph:'sec'},{key:'s2',label:'Set 2',ph:'sec'},{key:'s3',label:'Set 3',ph:'sec'}] },
      { name: 'Dead bug — core stability', target: '2 × 10 each side', rainier: true, fields: [{key:'notes',label:'notes',ph:'How was your form?',isNote:true}] }
    ]
  },
  {
    id: 'sun', label: 'Sun', fullDay: 'Sun Mar 29', title: 'Yoga / active recovery',
    accent: 'k-accent-yoga', type: 'Recovery', duration: '~50 min',
    exercises: [
      { name: 'Yoga class OR guided stretching session', target: '30–60 min', rainier: false, fields: [{key:'duration',label:'min',ph:'45'},{key:'type',label:'type',ph:'class / solo'}] },
      { name: 'Bonus easy outdoor walk (optional)', target: '~20 min', rainier: true, fields: [{key:'duration',label:'min',ph:'20'},{key:'miles',label:'mi',ph:'0.8'}] }
    ]
  }
];
const K_FEELINGS = ['Easy','Good','Hard','Beat'];
const K_FEEL_CLASSES = ['sel-easy','sel-good','sel-hard','sel-beat'];

function kGetVal(dayId, exIdx, fieldKey) { return kylieState[dayId]?.inputs?.[`${exIdx}_${fieldKey}`] || ''; }
function kSetVal(dayId, exIdx, fieldKey, val) {
  if (!kylieState[dayId]) kylieState[dayId] = {};
  if (!kylieState[dayId].inputs) kylieState[dayId].inputs = {};
  kylieState[dayId].inputs[`${exIdx}_${fieldKey}`] = val;
}

function kCompletedCount() { return KYLIE_DAYS.filter(d => kylieState[d.id]?.completed).length; }

function renderKylieUI() {
  renderKStrip();
  renderKProgress();
  renderKContent();
}

function renderKStrip() {
  document.getElementById('kStrip').innerHTML = KYLIE_DAYS.map(d => {
    const done = kylieState[d.id]?.completed;
    return `<div class="k-strip-cell${done?' done':''}" onclick="kToggleDay('${d.id}')">
      <div class="k-strip-dot"></div>
      <div class="k-strip-day">${d.label}</div>
      <div class="k-strip-type">${d.type}</div>
    </div>`;
  }).join('');
}

function renderKProgress() {
  const n = kCompletedCount();
  document.getElementById('kProgressCount').textContent = `${n} / 4 sessions`;
  document.getElementById('kProgressFill').style.width = Math.round(n/4*100) + '%';
}

function renderKContent() {
  const container = document.getElementById('kContent');
  let html = '';
  KYLIE_DAYS.forEach((d, di) => {
    const isDone = !!kylieState[d.id]?.completed;
    const isOpen = kOpenDay === d.id;
    const feeling = kylieState[d.id]?.feeling || '';
    let exHtml = '';
    d.exercises.forEach((ex, ei) => {
      let fieldsHtml = '';
      ex.fields.forEach(f => {
        const val = kGetVal(d.id, ei, f.key);
        if (f.isNote) {
          fieldsHtml += `<textarea class="k-note-input" data-day="${d.id}" data-ex="${ei}" data-field="${f.key}" placeholder="${f.ph}" rows="2" ${isDone?'disabled':''}>${val}</textarea>`;
        } else {
          fieldsHtml += `<div class="k-input-row"><div class="k-input-unit">${f.label}</div><input class="k-ex-input" type="number" inputmode="decimal" data-day="${d.id}" data-ex="${ei}" data-field="${f.key}" placeholder="${f.ph}" value="${val}" ${isDone?'disabled':''}></div>`;
        }
      });
      exHtml += `<div class="k-ex-block"><div class="k-ex-header"><div class="k-ex-name">${ex.name}</div>${ex.rainier?'<span class="k-rainier-tag">Rainier</span>':''}</div><div class="k-ex-target">${ex.target}</div><div class="k-input-grid">${fieldsHtml}</div></div>`;
    });
    const feelBtns = K_FEELINGS.map((f,fi) => {
      const selClass = feeling === f ? K_FEEL_CLASSES[fi] : '';
      return `<button class="k-feel-btn ${selClass}" data-day="${d.id}" data-feeling="${f}" ${isDone?'disabled':''}>${f}</button>`;
    }).join('');
    html += `<div class="k-day-card${isDone?' done':''}" id="kcard_${d.id}">
      <div class="k-day-header" onclick="kToggleDay('${d.id}')">
        <div class="k-day-accent ${d.accent}"></div>
        <div class="k-day-info"><div class="k-day-name">${d.fullDay} — ${d.title}</div><div class="k-day-meta">${d.type} · ${d.duration}</div></div>
        <span class="k-badge ${isDone?'k-badge-done':'k-badge-pending'}">${isDone?'Done ✓':'Log'}</span>
        <span class="k-chevron${isOpen?' open':''}">⌄</span>
      </div>
      <div class="k-day-body${isOpen?' open':''}" id="kbody_${d.id}">
        ${exHtml}
        <div class="k-feeling-section"><div class="k-feeling-label">How did this feel?</div><div class="k-feeling-row">${feelBtns}</div></div>
        <div class="k-complete-wrap"><button class="k-complete-btn ${isDone?'finished':'pending'}" data-day="${d.id}" ${isDone?'disabled':''}>${isDone?'Session logged ✓':'Mark session complete'}</button></div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
  attachKListeners();
}

function attachKListeners() {
  document.querySelectorAll('.k-ex-input, .k-note-input').forEach(el => {
    el.addEventListener('input', () => {
      kSetVal(el.dataset.day, parseInt(el.dataset.ex), el.dataset.field, el.value);
      autoSave();
    });
  });
  document.querySelectorAll('.k-feel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dayId = btn.dataset.day;
      if (!kylieState[dayId]) kylieState[dayId] = {};
      kylieState[dayId].feeling = btn.dataset.feeling;
      autoSave();
      renderKContent();
    });
  });
  document.querySelectorAll('.k-complete-btn.pending').forEach(btn => {
    btn.addEventListener('click', () => {
      const dayId = btn.dataset.day;
      if (!kylieState[dayId]) kylieState[dayId] = {};
      kylieState[dayId].completed = true;
      kylieState[dayId].completedAt = new Date().toLocaleDateString();
      autoSave();
      renderKylieUI();
    });
  });
}

function kToggleDay(dayId) {
  kOpenDay = kOpenDay === dayId ? null : dayId;
  kylieState._open = kOpenDay;
  renderKylieUI();
  if (kOpenDay) {
    setTimeout(() => {
      document.getElementById('kcard_' + dayId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}
