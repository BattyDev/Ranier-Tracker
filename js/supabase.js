// ═══════════════════════════════════════════
// SUPABASE DATA LAYER
// ═══════════════════════════════════════════

async function sbFetch(method, path, body) {
  if (!supabaseReady) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) return null;
    if (res.status === 200) { try { return await res.json(); } catch { return []; } }
    return [];
  } catch(e) { return null; }
}

async function loadData(user, week) {
  const rows = await sbFetch('GET', `/tracker_data?user_id=eq.${user}&week=eq.${week}&select=data`);
  if (!rows || rows.length === 0) return {};
  try { return JSON.parse(rows[0].data); } catch { return {}; }
}

async function saveData(user, week, data) {
  if (!supabaseReady) { updateLastSaved('⚠ Supabase not set up'); return; }
  isSaving = true;
  updateLastSaved('Saving…');
  const result = await sbFetch('POST', '/tracker_data', {
    user_id: user, week, data: JSON.stringify(data),
    updated_at: new Date().toISOString()
  });
  isSaving = false;
  if (result !== null) {
    const t = new Date();
    updateLastSaved(`Saved ${t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`);
  } else {
    updateLastSaved('Save failed — check connection');
  }
}

function updateLastSaved(msg) {
  const cEl = document.getElementById('lastSavedCody');
  const kEl = document.getElementById('lastSavedKylie');
  if (cEl) cEl.textContent = msg;
  if (kEl) kEl.textContent = msg;
}
