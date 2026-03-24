// ═══════════════════════════════════════════
// APPLICATION STATE
// ═══════════════════════════════════════════

let activeUser = null;
let activeWeek = 'week1';
let currentDay = 0;
let pinBuffer = '';
let isDemoMode = false;
let codyPainSelections = {};
let codyLoggedExercises = new Set();
let codyState = {};
let kylieState = {};
let kOpenDay = null;
let autoSaveTimer = null;
let isSaving = false;
