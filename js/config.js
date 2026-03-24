// ═══════════════════════════════════════════
// CONFIGURATION — Supabase credentials & PINs
// ═══════════════════════════════════════════

const SUPABASE_URL = 'https://pqshfynscuwapahpzjug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxc2hmeW5zY3V3YXBhaHB6anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMjI5NjUsImV4cCI6MjA4OTg5ODk2NX0.7vGReE6aTFTehZQTKDTaoSSEdBbqIHI-SYb86UNvhsk';

const PINS = {
  cody: '228626',
  kylie: '966337',
  demo: '101010'
};

// Check config
const supabaseReady = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
if (!supabaseReady) {
  document.getElementById('configBanner').classList.add('show');
}
