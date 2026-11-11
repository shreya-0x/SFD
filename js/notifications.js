/**
 * SFD - Toast, Milestones & Browser Notifications
 */

// Toast notifications
function toast(msg, type = 'i') {
  const container = document.getElementById('tw');
  if (!container) return;

  const t = document.createElement('div');
  t.className = 'toast t' + type;
  t.innerHTML = `<div class="tdot"></div><span>${msg}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// Milestone celebration modal
function showMilestone(g, type) {
  const emojis = ['🔥', '⭐', '💎', '🚀', '🏅'];
  const emoji = type === 'complete' ? '🏆' : emojis[Math.floor(Math.random() * emojis.length)];
  
  const me = document.getElementById('me');
  const mt = document.getElementById('mt');
  const ms = document.getElementById('ms');
  const modal = document.getElementById('milestone-modal');

  if (me) me.textContent = emoji;
  if (mt) mt.textContent = type === 'complete' ? 'Goal Completed!' : 'Milestone Reached!';
  if (ms) ms.textContent = type === 'complete' 
    ? `You completed "${g.name}"! Incredible!` 
    : `${g.streak}-day streak on "${g.name}"! Keep going!`;

  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      if (modal.style.display === 'flex') modal.style.display = 'none';
    }, 5000);
  }
}

// Browser notifications & reminder loop
function requestNotifPermission() {
  if (!('Notification' in window)) {
    toast('❌ Your browser does not support notifications', 'e');
    return;
  }
  Notification.requestPermission().then(perm => {
    const btn = document.getElementById('notif-perm-btn');
    const msg = document.getElementById('notif-denied-msg');

    if (perm === 'granted') {
      if (btn) btn.style.display = 'none';
      if (msg) msg.style.display = 'none';
      toast('🔔 Notifications enabled!', 's');
      updateNotifStatuses();
      startNotifLoop();
    } else {
      if (msg) msg.style.display = 'block';
      toast('⚠️ Notification permission denied', 'e');
    }
  });
}

function updateNotifStatuses() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const userKey = user ? user.email : 'guest';
  const hKey = 'sfd_habit_notif_' + userKey;
  const gKey = 'sfd_goal_notif_' + userKey;
  
  const hd = JSON.parse(localStorage.getItem(hKey) || 'null');
  const gd = JSON.parse(localStorage.getItem(gKey) || 'null');
  
  const hEl = document.getElementById('habit-notif-status');
  const gEl = document.getElementById('goal-notif-status');
  
  if (hEl) {
    hEl.textContent = hd ? '✅ Scheduled at ' + hd.time : 'Not scheduled';
    hEl.style.color = hd ? 'var(--green)' : 'var(--text3)';
  }
  if (gEl) {
    gEl.textContent = gd ? '✅ Scheduled at ' + gd.time : 'Not scheduled';
    gEl.style.color = gd ? 'var(--green)' : 'var(--text3)';
  }
  
  const hTimeInp = document.getElementById('habit-notif-time');
  const gTimeInp = document.getElementById('goal-notif-time');
  if (hd && hTimeInp) hTimeInp.value = hd.time;
  if (gd && gTimeInp) gTimeInp.value = gd.time;
}

function scheduleHabitReminder() {
  if (Notification.permission !== 'granted') {
    requestNotifPermission();
    return;
  }
  const time = document.getElementById('habit-notif-time').value || '20:00';
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const key = 'sfd_habit_notif_' + (user ? user.email : 'guest');
  
  localStorage.setItem(key, JSON.stringify({ time, type: 'habit' }));
  toast('🔁 Habit reminder set for ' + time + ' daily!', 's');
  updateNotifStatuses();
  startNotifLoop();
}

function scheduleGoalReminder() {
  if (Notification.permission !== 'granted') {
    requestNotifPermission();
    return;
  }
  const time = document.getElementById('goal-notif-time').value || '18:00';
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const key = 'sfd_goal_notif_' + (user ? user.email : 'guest');
  
  localStorage.setItem(key, JSON.stringify({ time, type: 'goal', lastSent: null }));
  toast('🎯 Goal reminder set for ' + time + ' every 3 days!', 's');
  updateNotifStatuses();
  startNotifLoop();
}

function startNotifLoop() {
  if (window._notifLoopRunning) return;
  window._notifLoopRunning = true;

  setInterval(() => {
    if (Notification.permission !== 'granted') return;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) return;

    const now = new Date();
    const nowHHMM = now.toTimeString().slice(0, 5);
    const todayDate = todayStr();

    // Habit reminder - daily
    const hKey = 'sfd_habit_notif_' + user.email;
    const hd = JSON.parse(localStorage.getItem(hKey) || 'null');
    if (hd && hd.time === nowHHMM) {
      const sentKey = hKey + '_sent_' + todayDate;
      if (!localStorage.getItem(sentKey)) {
        const todayDone = D.habits.filter(h => h.completed && h.completed[todayDate]).length;
        const total = D.habits.length;
        if (total > 0 && todayDone < total) {
          new Notification('SFD — Daily Habit Reminder 🔁', {
            body: `You've done ${todayDone}/${total} habits today. Don't break your streak!`,
            icon: 'https://em-content.zobj.net/source/google/387/repeat-button_1f501.png'
          });
          localStorage.setItem(sentKey, '1');
        }
      }
    }

    // Goal reminder - every 3 days
    const gKey = 'sfd_goal_notif_' + user.email;
    const gd = JSON.parse(localStorage.getItem(gKey) || 'null');
    if (gd && gd.time === nowHHMM) {
      const lastSent = gd.lastSent;
      const daysSinceLast = lastSent ? Math.floor((now - new Date(lastSent)) / (1000 * 60 * 60 * 24)) : 999;
      const sentKey = gKey + '_sent_' + todayDate;
      if (daysSinceLast >= 3 && !localStorage.getItem(sentKey)) {
        const stale = D.goals.filter(g => !g.lastCheckin || Math.floor((now - new Date(g.lastCheckin)) / (1000 * 60 * 60 * 24)) >= 3);
        if (stale.length > 0) {
          new Notification('SFD — Goal Update Reminder 🎯', {
            body: `${stale.length} goal${stale.length > 1 ? 's' : ''} need${stale.length === 1 ? 's' : ''} updating! Keep your progress going.`,
            icon: 'https://em-content.zobj.net/source/google/387/direct-hit_1f3af.png'
          });
          gd.lastSent = todayDate;
          localStorage.setItem(gKey, JSON.stringify(gd));
          localStorage.setItem(sentKey, '1');
        }
      }
    }
  }, 60000);
}
