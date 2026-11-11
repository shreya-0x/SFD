/**
 * SFD - Application Orchestrator & Router
 */

let curPage = 'landing';
const navMap = {
  home: 0,
  finance: 1,
  habits: 2,
  goals: 3,
  analytics: 4
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  if (id in navMap) {
    const navButtons = document.querySelectorAll('.nav-btn');
    if (navButtons[navMap[id]]) navButtons[navMap[id]].classList.add('active');
  }

  curPage = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (id === 'landing') {
    if (typeof window._animParticles === 'function') {
      window._animParticles();
    }
  }

  if (id === 'finance') {
    if (typeof initFinCharts === 'function') initFinCharts();
    if (typeof renderTxns === 'function') renderTxns();
    if (typeof updateBal === 'function') updateBal();
  }

  if (id === 'habits') {
    if (typeof renderHabits === 'function') renderHabits();
    if (typeof updateHabCharts === 'function') updateHabCharts();
  }

  if (id === 'goals') {
    if (typeof renderGoals === 'function') renderGoals();
    if (typeof updateGoalCharts === 'function') updateGoalCharts();
    if (typeof updateGoalSummary === 'function') updateGoalSummary();
  }

  if (id === 'analytics') {
    if (typeof initAnalyticsCharts === 'function') initAnalyticsCharts();
    setTimeout(() => {
      if (typeof updateNotifStatuses === 'function') updateNotifStatuses();
      if ('Notification' in window && Notification.permission === 'granted') {
        const btn = document.getElementById('notif-perm-btn');
        if (btn) btn.style.display = 'none';
        if (typeof startNotifLoop === 'function') startNotifLoop();
      } else if ('Notification' in window && Notification.permission === 'denied') {
        const msg = document.getElementById('notif-denied-msg');
        if (msg) msg.style.display = 'block';
      }
    }, 100);
  }

  updateAllDates();
}

function updateAllDates() {
  const now = new Date();
  const ds = fmtDate(now);
  const ts = fmtTime(now);

  ['live-clock', 'landing-time'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.textContent = ts;
  });

  ['landing-date', 'home-date', 'fin-date', 'hab-date', 'goal-date', 'ana-date'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.textContent = ds;
  });
}

function scrollToFeatures() {
  const el = document.getElementById('page-landing');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  setTimeout(() => showPage('home'), 400);
}

// Clock & day rollover checks
updateAllDates();
setInterval(updateAllDates, 1000);

let lastDay = todayStr();
setInterval(() => {
  const d = todayStr();
  if (d !== lastDay) {
    lastDay = d;
    if (curPage === 'habits' && typeof renderHabits === 'function') renderHabits();
    if (curPage === 'goals' && typeof renderGoals === 'function') renderGoals();
  }
}, 60000);

// Global start
document.addEventListener('DOMContentLoaded', () => {
  updateAllDates();
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user) {
    const nameEl = document.getElementById('user-name-nav');
    if (nameEl) nameEl.textContent = '👤 ' + user.name.split(' ')[0];
  }
});
