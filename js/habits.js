/**
 * SFD - Habit Tracking & Consistency Charts
 */

const colMap = {
  neon: '#4f9eff',
  neon2: '#7c5cfc',
  neon3: '#00e5c8',
  green: '#22c55e',
  amber: '#f59e0b',
  pink: '#ec4899'
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let habLCh = null;

function addHabit() {
  const nameInp = document.getElementById('hi');
  const emInp = document.getElementById('hem');
  const colInp = document.getElementById('hcol');

  if (!nameInp) return;
  const name = nameInp.value.trim();
  const em = emInp && emInp.value ? emInp.value : '✅';
  const col = colInp ? colInp.value : 'neon';

  if (!name) {
    toast('Enter a habit name', 'e');
    return;
  }

  D.habits.push({
    id: Date.now(),
    name,
    emoji: em,
    color: col,
    completed: {}
  });

  save();
  nameInp.value = '';
  if (emInp) emInp.value = '';

  toast('Habit added! 🔁', 's');
  renderHabits();
  updateHabCharts();
}

function togHabit(hid, ds) {
  const h = D.habits.find(h => h.id === hid);
  if (!h) return;
  if (!h.completed) h.completed = {};
  h.completed[ds] = !h.completed[ds];

  save();
  renderHabits();
  updateHabCharts();
}

function delHabit(id) {
  D.habits = D.habits.filter(h => h.id !== id);
  save();
  renderHabits();
  updateHabCharts();
  toast('Habit removed', 'i');
}

function getStreak(h) {
  let s = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    if (h.completed && h.completed[k]) {
      s++;
    } else {
      break;
    }
  }
  return s;
}

function renderHabits() {
  const grid = document.getElementById('hgrid');
  const tp = document.getElementById('tp');
  if (!grid || !tp) return;

  const dates = get14Days();
  const today = todayStr();

  if (!D.habits.length) {
    grid.innerHTML = '<div class="es">🌱 Add habits to start tracking</div>';
    tp.innerHTML = '<div class="es" style="padding:.5rem;font-size:.85rem">No habits yet</div>';
    return;
  }

  grid.innerHTML = D.habits.map(h => {
    const streak = getStreak(h);
    const clr = colMap[h.color] || '#4f9eff';

    const boxes = dates.map(ds => {
      const done = h.completed && h.completed[ds];
      const isToday = ds === today;
      const dayN = ds.slice(8);
      const mnth = MONTHS[parseInt(ds.slice(5, 7)) - 1];

      return `
        <div class="db2${done ? ' done' : ''}" 
             style="${done ? `background:${clr}22;border-color:${clr}66;color:${clr};box-shadow:0 0 6px ${clr}28` : isToday ? 'border-color:rgba(255,255,255,0.3)' : ''}" 
             onclick="togHabit(${h.id},'${ds}')" 
             title="${ds}${isToday ? ' (Today)' : ''}">
          <span style="font-size:.7rem;font-weight:600">${dayN}</span>
          <span style="font-size:.52rem;opacity:.7">${mnth}</span>
        </div>
      `;
    }).join('');

    const doneToday = h.completed && h.completed[today];

    return `
      <div class="hr">
        <div class="hh">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:1.1rem">${h.emoji}</span>
            <span class="hn">${h.name}</span>
            ${doneToday 
              ? '<span style="font-size:.68rem;background:rgba(34,197,94,0.15);color:#22c55e;padding:2px 8px;border-radius:8px">✓ Done today</span>' 
              : '<span style="font-size:.68rem;background:rgba(79,158,255,0.1);color:var(--neon);padding:2px 8px;border-radius:8px">Pending</span>'}
          </div>
          <div style="display:flex;align-items:center;gap:.6rem">
            <span style="font-size:.78rem;color:var(--amber)">🔥 ${streak}d</span>
            <button class="db" onclick="delHabit(${h.id})" title="Delete habit">✕</button>
          </div>
        </div>
        <div class="hdays">${boxes}</div>
      </div>
    `;
  }).join('');

  const done = D.habits.filter(h => h.completed && h.completed[today]).length;
  const tot = D.habits.length;
  const pct = tot ? Math.round(done / tot * 100) : 0;
  const pclr = pct === 100 ? '#22c55e' : pct >= 50 ? '#4f9eff' : '#7c5cfc';

  tp.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
      <span style="font-size:.9rem">${done}/${tot} done today</span>
      <span style="font-family:'Syne',sans-serif;font-weight:700;color:${pclr}">${pct}%</span>
    </div>
    <div class="pbw"><div class="pbf" style="width:${pct}%;background:${pclr}"></div></div>
    ${pct === 100 ? '<div style="margin-top:.5rem;font-size:.82rem;color:var(--green);text-align:center">🎉 All habits done today!</div>' : ''}
  `;
}

function updateHabCharts() {
  const canvas = document.getElementById('hlc');
  const hr = document.getElementById('hrates');
  if (!canvas) return;

  const dates = get14Days();
  const { grid, tick } = chartColors();

  if (habLCh) habLCh.destroy();

  const datasets = D.habits.map(h => {
    const clr = colMap[h.color] || '#4f9eff';
    const data = dates.map(d => (h.completed && h.completed[d] ? 100 : 0));
    return {
      label: h.emoji + ' ' + h.name,
      data,
      borderColor: clr,
      backgroundColor: clr + '15',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: clr,
      pointRadius: 3
    };
  });

  if (!D.habits.length) {
    habLCh = new Chart(canvas, {
      type: 'line',
      data: { labels: dates.map(d => d.slice(5)), datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  } else {
    habLCh = new Chart(canvas, {
      type: 'line',
      data: { labels: dates.map(d => d.slice(5)), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: D.habits.length > 0,
            labels: { color: tick, font: { size: 10 }, boxWidth: 10, padding: 8 }
          }
        },
        scales: {
          x: {
            ticks: { color: tick, font: { size: 9 }, maxRotation: 45, autoSkip: false },
            grid: { color: grid }
          },
          y: {
            min: 0,
            max: 110,
            ticks: {
              color: tick,
              font: { size: 9 },
              callback: v => (v === 0 ? '❌' : v === 100 ? '✅' : '')
            },
            grid: { color: grid }
          }
        }
      }
    });
  }

  if (!hr) return;
  if (!D.habits.length) {
    hr.innerHTML = '<div class="es">No habits yet</div>';
    return;
  }

  hr.innerHTML = D.habits.map(h => {
    const done = dates.filter(d => h.completed && h.completed[d]).length;
    const pct = Math.round(done / 14 * 100);
    const clr = colMap[h.color] || '#4f9eff';

    return `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:3px">
          <span>${h.emoji} ${h.name}</span>
          <span style="color:${clr};font-family:'Syne',sans-serif;font-weight:700">${pct}%</span>
        </div>
        <div class="pbw" style="height:5px">
          <div style="height:100%;width:${pct}%;background:${clr};border-radius:10px;transition:.5s"></div>
        </div>
      </div>
    `;
  }).join('');
}
