import { signal, computed } from '@preact/signals';

// Core app state
export const currentUser = signal(null);        // user row from DB
export const currentScreen = signal('landing'); // landing | pin | weeks | tracker
export const selectedUser = signal(null);       // 'cody' or 'kylie' (before PIN)
export const isDemoMode = signal(false);

// Week/plan state
export const currentWeek = signal(null);        // workout_plans row
export const currentPlan = signal(null);        // { plan, days, sections, exercises }
export const currentDay = signal(0);            // day tab index

// Logs state
export const exerciseLogs = signal({});         // { exerciseId: logRow }
export const dayCheckIns = signal({});          // { dayId: checkInRow }

// Theme
const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : 'dark';
export const theme = signal(savedTheme || 'dark');

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme.value);
}

// Save state
export const saveStatus = signal('');           // '', 'Saving…', 'Saved 12:34', 'Save failed'
export const isSaving = signal(false);

// Computed
export const userTheme = computed(() => currentUser.value?.theme || 'cody');

// Navigation helpers
export function navigate(screen) {
  currentScreen.value = screen;
}

export function signOut() {
  currentUser.value = null;
  currentWeek.value = null;
  currentPlan.value = null;
  currentDay.value = 0;
  exerciseLogs.value = {};
  dayCheckIns.value = {};
  isDemoMode.value = false;
  navigate('landing');
}

export function goToWeeks() {
  currentWeek.value = null;
  currentPlan.value = null;
  currentDay.value = 0;
  exerciseLogs.value = {};
  dayCheckIns.value = {};
  navigate('weeks');
}
