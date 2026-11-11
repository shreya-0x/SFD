/**
 * SFD - Goals Streak Tracker & Analytics
 */

const tVarC = {
  financial: '#22c55e',
  personal: '#4f9eff',
  purchase: '#f59e0b'
};

const tBadge = {
  financial: 'bf',
  personal: 'bp',
  purchase: 'bu'
};

const tLabel = {
  financial: '💰 Financial',
  personal: '⭐ Personal',
  purchase: '🛍 Purchase'
};

let gBCh = null;

function addGoal() {
  const nameInp = document.getElementById('gn');
  const typeInp = document.getElementById('gt2');
  const tgtInp = document.getElementById('gtgt');
  const dlInp = document.getElementById('gdl');
  const noteInp = document.getElementById('gnote');

  if (!nameInp) return;
  const name = nameInp.value.trim();
  const type = typeInp ? typeInp.value : 'financial';
  const target = parseFloat(tgtInp ? tgtInp.value : 100) || 100;
  const deadline = dlInp ? dlInp.value : '';
  const note = noteInp ? noteInp.value.trim() : '';

  if (!name) {
    toast('Enter a goal name', 'e');
    return;
  }

  D.goals.push({
    id: Date.now(),
    name,
    type,
    target,
    progress: 0,
    streak: 0,
    lastCheckin: null,
    deadline,
    note,
    createdAt: todayStr()
  });

  save();
  ['gn', 'gtgt', 'gnote', 'gdl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  toast('Goal added! 🎯', 's');
  renderGoals();
  updateGoalCharts();
  updateGoalSummary();
}

function updGoalCustom(id) {
  const inp = document.getElementById('cam_' + id);
  if (!inp) return;
  const val = parseFloat(inp.value);

  if (!val || val <= 0) {
    toast('Enter a valid amount', 'e');
    return;
  }

  const g = D.goals.find(g => g.id === id);
  if (!g) return;

  g.progress = Math.min(g.target, Math.round((g.progress + val) * 100) / 100);
  const today = todayStr();

  if (g.lastCheckin !== today) {
    g.streak = (g.streak || 0) + 1;
    g.lastCheckin = today;
    if ([3, 7, 14, 21, 30, 60, 100].includes(g.streak)) {
      showMilestone(g, 'streak');
    }
  }

  if (g.progress >= g.target) {
    showMilestone(g, 'complete');
  }

  save();
  inp.value = '';
  renderGoals();
  updateGoalCharts();
  updateGoalSummary();
  toast(`+₹${val.toLocaleString('en-IN')} added to "${g.name}"!`, 's');
}

function updGoalProg(id, delta) {
  const g = D.goals.find(g => g.id === id);
  if (!g) return;

  g.progress = Math.max(0, Math.min(g.target, Math.round((g.progress + delta) * 100) / 100));
  const today = todayStr();

  if (g.lastCheckin !== today) {
    g.streak = (g.streak || 0) + 1;
    g.lastCheckin = today;
    if ([3, 7, 14, 21, 30, 60, 100].includes(g.streak)) {
      showMilestone(g, 'streak');
    }
  }

  if (g.progress >= g.target) {
    showMilestone(g, 'complete');
  }

  save();
  renderGoals();
  updateGoalCharts();
  updateGoalSummary();
}

function resetGoal(id) {
  const g = D.goals.find(g => g.id === id);
  if (!g) return;
  if (!confirm('Reset progress for "' + g.name + '"?')) return;

  g.progress = 0;
  g.streak = 0;
  g.lastCheckin = null;

  save();
  renderGoals();
  updateGoalCharts();
  updateGoalSummary();
  toast('Goal reset', 'i');
}

function delGoal(id) {
  D.goals = D.goals.filter(g => g.id !== id);
  save();
  renderGoals();
  updateGoalCharts();
  updateGoalSummary();
  toast('Goal removed', 'i');
}

function getDaysLeft(dl) {
  if (!dl) return null;
  return Math.ceil((new Date(dl) - new Date()) / (1000 * 60 * 60 * 24));
}

function circSVG(pct, clr) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return `
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(128,128,128,0.15)" stroke-width="5"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="${clr}" stroke-width="5" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>
      <text x="32" y="37" text-anchor="middle" fill="${clr}" font-size="12" font-family="Syne" font-weight="700">${Math.round(pct)}%</text>
    </svg>
  `;
}

function renderGoals() {
  const grid = document.getElementById('gg');
  if (!grid) return;

  if (!D.goals.length) {
    grid.innerHTML = '<div class="es" style="grid-column:1/-1">🎯 No goals yet — add your first goal!</div>';
    return;
  }

  grid.innerHTML = D.goals.map(g => {
    const pct = Math.min(100, g.target > 0 ? Math.round(g.progress / g.target * 100) : 0);
    const clr = tVarC[g.type];
    const dl = getDaysLeft(g.deadline);
    const isComplete = g.progress >= g.target;
    const streak = g.streak || 0;
    const fires = Math.min(5, Math.floor(streak / 5) + 1);
    const checkedToday = g.lastCheckin === todayStr();
    const isRupee = g.type === 'financial' || g.type === 'purchase';
    const fmt = v => isRupee ? '₹' + Math.round(v).toLocaleString('en-IN') : Math.round(v * 100) / 100;

    let dlBadge = '';
    if (g.deadline) {
      if (dl < 0) dlBadge = `<span class="due-badge due-over">⚠ ${Math.abs(dl)}d overdue</span>`;
      else if (dl === 0) dlBadge = `<span class="due-badge due-over">⚠ Due today!</span>`;
      else if (dl <= 7) dlBadge = `<span class="due-badge due-soon">⏰ ${dl}d left</span>`;
      else dlBadge = `<span class="due-badge">${dl}d left</span>`;
    }

    const remaining = Math.max(0, g.target - g.progress);
    const quickAmts = isRupee ? [100, 500, 1000] : null;

    return `
      <div class="gcard" style="${isComplete ? 'border-color:rgba(34,197,94,0.35);background:rgba(34,197,94,0.03)' : ''}">
        ${isComplete ? '<div style="position:absolute;top:.75rem;right:.75rem;font-size:.68rem;background:rgba(34,197,94,0.15);color:var(--green);padding:3px 10px;border-radius:10px;font-weight:600;letter-spacing:.5px">✓ COMPLETED</div>' : ''}
        
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.6rem">
          <div style="flex:1;padding-right:.5rem">
            <div style="font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;margin-bottom:4px">${g.name}</div>
            <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap">
              <span class="gbadge ${tBadge[g.type]}">${tLabel[g.type]}</span>
              ${dlBadge}
            </div>
          </div>
          <div>${circSVG(pct, clr)}</div>
        </div>

        ${g.note ? `<div style="font-size:.78rem;color:var(--text2);margin-bottom:.75rem;padding:.5rem .75rem;background:var(--bg3);border-left:2px solid ${clr}55;border-radius:0 8px 8px 0;font-style:italic">"${g.note}"</div>` : ''}

        <div class="gstats">
          <div class="gstat"><div class="gsv" style="color:${clr}">${fmt(g.progress)}</div><div class="gsl">Saved</div></div>
          <div class="gstat"><div class="gsv">${fmt(g.target)}</div><div class="gsl">Target</div></div>
          <div class="gstat"><div class="gsv" style="color:var(--amber)">${streak}</div><div class="gsl">Streak 🔥</div></div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--text2);margin-bottom:.5rem">
          <span>${isComplete ? '🎊 Goal complete!' : fmt(remaining) + ' more to go'}</span>
          ${g.deadline ? `<span>Due: ${g.deadline}</span>` : ''}
        </div>

        <div class="pbw"><div class="pbf" style="width:${pct}%;background:${clr}"></div></div>

        <div style="display:flex;align-items:center;justify-content:center;gap:.25rem;margin:.5rem 0 .2rem">
          ${'🔥'.repeat(fires)}
          <span style="font-size:.73rem;color:var(--amber);font-family:'Syne',sans-serif;font-weight:700;margin-left:4px">${streak}-day streak</span>
          ${checkedToday ? '<span style="font-size:.68rem;background:rgba(34,197,94,0.12);color:var(--green);padding:2px 8px;border-radius:8px;margin-left:4px">✓ Updated today</span>' : ''}
        </div>

        <!-- Custom / Quick Amount Row -->
        ${!isComplete ? `
          <div class="cam-row">
            <input class="cam-inp" id="cam_${g.id}" type="number" placeholder="${isRupee ? 'Enter ₹ amount (e.g. 150)' : 'Enter amount'}" min="0" step="any" onkeydown="if(event.key==='Enter')updGoalCustom(${g.id})">
            <button class="cam-btn" onclick="updGoalCustom(${g.id})">Add Amount</button>
          </div>
          <div style="display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap">
            ${quickAmts ? quickAmts.map(a => `
              <button onclick="(function(){document.getElementById('cam_${g.id}').value=${a};updGoalCustom(${g.id})})()" style="padding:5px 10px;background:var(--glass2);border:1px solid var(--border);border-radius:8px;color:var(--neon);font-size:.75rem;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700">+₹${a.toLocaleString('en-IN')}</button>
            `).join('') : ''}
            ${!isRupee ? `
              <button onclick="updGoalProg(${g.id},1)" style="padding:5px 12px;background:var(--glass2);border:1px solid var(--border);border-radius:8px;color:var(--neon);font-size:.75rem;cursor:pointer">+1</button>
              <button onclick="updGoalProg(${g.id},5)" style="padding:5px 12px;background:var(--glass2);border:1px solid var(--border);border-radius:8px;color:var(--neon);font-size:.75rem;cursor:pointer">+5</button>
            ` : ''}
          </div>
        ` : ''}

        <div class="gacts" style="margin-top:.6rem">
          ${!isComplete ? `<button class="gbtn" onclick="updGoalProg(${g.id},-1)" ${g.progress <= 0 ? 'disabled' : ''} title="Remove 1">−1</button>` : ''}
          <button class="gbtn" onclick="resetGoal(${g.id})" title="Reset progress">↺ Reset</button>
          <button class="gbtn" onclick="delGoal(${g.id})" style="color:var(--red);border-color:rgba(239,68,68,.3)" onmouseover="this.style.background='rgba(239,68,68,.1)'" onmouseout="this.style.background='var(--bg3)'">🗑 Delete</button>
        </div>
        <div style="font-size:.7rem;color:var(--text3);text-align:center;margin-top:.4rem">Started: ${g.createdAt || 'N/A'}</div>
      </div>
    `;
  }).join('');
}

function updateGoalSummary() {
  const total = D.goals.length;
  const done = D.goals.filter(g => g.progress >= g.target).length;
  const bestStreak = D.goals.reduce((m, g) => Math.max(m, g.streak || 0), 0);
  const avgPct = total ? Math.round(D.goals.reduce((s, g) => s + Math.min(100, g.target > 0 ? g.progress / g.target * 100 : 0), 0) / total) : 0;

  const eTot = document.getElementById('gs-total');
  const eDone = document.getElementById('gs-done');
  const eStr = document.getElementById('gs-streak');
  const eAvg = document.getElementById('gs-avg');

  if (eTot) eTot.textContent = total;
  if (eDone) eDone.textContent = done;
  if (eStr) eStr.textContent = bestStreak;
  if (eAvg) eAvg.textContent = avgPct + '%';
}

function updateGoalCharts() {
  const canvas = document.getElementById('gbc');
  const slb = document.getElementById('slb');
  if (!canvas) return;

  if (gBCh) gBCh.destroy();
  const { grid, tick } = chartColors();

  if (!D.goals.length) {
    if (slb) slb.innerHTML = '<div class="es">No goals yet</div>';
    return;
  }

  gBCh = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: D.goals.map(g => (g.name.length > 14 ? g.name.slice(0, 14) + '…' : g.name)),
      datasets: [{
        label: 'Progress %',
        data: D.goals.map(g => Math.round(Math.min(100, g.target > 0 ? g.progress / g.target * 100 : 0))),
        backgroundColor: D.goals.map(g => tVarC[g.type] + '99'),
        borderColor: D.goals.map(g => tVarC[g.type]),
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tick, font: { size: 9 } }, grid: { color: grid } },
        y: {
          min: 0,
          max: 100,
          ticks: { color: tick, font: { size: 10 }, callback: v => v + '%' },
          grid: { color: grid }
        }
      }
    }
  });

  if (!slb) return;
  const sorted = [...D.goals].sort((a, b) => (b.streak || 0) - (a.streak || 0));
  slb.innerHTML = sorted.map((g, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 12px">
      <div style="display:flex;align-items:center;gap:.5rem">
        <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:.75rem;color:var(--text3);min-width:18px">#${i + 1}</span>
        <span style="font-size:.875rem">${g.name}</span>
        <span class="gbadge ${tBadge[g.type]}" style="padding:1px 7px;font-size:.63rem;margin-bottom:0">${g.type}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <span>🔥</span>
        <span style="font-family:'Syne',sans-serif;font-weight:700;color:var(--amber);font-size:.9rem">${g.streak || 0}d</span>
      </div>
    </div>
  `).join('');
}
