/**
 * SFD - State Management & Storage
 */

const SK = 'sfd_v3';
const USERS_KEY = 'sfd_users';
const SESSION_KEY = 'sfd_session';

let D = {
  transactions: [],
  habits: [],
  goals: []
};

// Load guest / initial data from localStorage
try {
  const s = localStorage.getItem(SK);
  if (s) D = { ...D, ...JSON.parse(s) };
} catch (e) {
  console.warn('Could not parse saved data from localStorage:', e);
}

// User-scoped saving helper
function save() {
  const key = window._activeUserDataKey || SK;
  try {
    localStorage.setItem(key, JSON.stringify(D));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

// Make save accessible globally
window.save = save;

// Helper: Format date for headers & pills
function fmtDate(d) {
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Helper: Format time for clock
function fmtTime(d) {
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Helper: Today's date string in YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Helper: Array of past 14 days dates [YYYY-MM-DD, ...]
function get14Days() {
  const d = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    d.push(dt.toISOString().split('T')[0]);
  }
  return d;
}
