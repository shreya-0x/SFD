/**
 * SFD - Unified Real-Time Analytics
 */

let anaChs = [];

function initAnalyticsCharts() {
  anaChs.forEach(c => {
    try { c.destroy(); } catch (e) {}
  });
  anaChs = [];

  const days = get14Days();
  const { grid, tick } = chartColors();

  // 1. Finance: income (green) vs expenses (red)
  const canFin = document.getElementById('ana-fin-chart');
  if (canFin) {
    const incD = days.map(day => 
      D.transactions.filter(t => t.type === 'income' && t.date === day).reduce((s, t) => s + t.amount, 0)
    );
    const expD = days.map(day => 
      D.transactions.filter(t => t.type === 'expense' && t.date === day).reduce((s, t) => s + t.amount, 0)
    );

    anaChs.push(new Chart(canFin, {
      type: 'bar',
      data: {
        labels: days.map(d => d.slice(5)),
        datasets: [
          {
            label: 'Income',
            data: incD,
            backgroundColor: 'rgba(34,197,94,0.7)',
            borderColor: '#22c55e',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: expD,
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderColor: '#ef4444',
            borderWidth: 1.5,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: tick, font: { size: 10 }, boxWidth: 10 } }
        },
        scales: {
          x: { ticks: { color: tick, font: { size: 9 }, maxRotation: 45, autoSkip: true }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { size: 9 }, callback: v => '₹' + Math.round(v) }, grid: { color: grid } }
        }
      }
    }));
  }

  // 2. Habits consistency chart
  const canHab = document.getElementById('ana-hab-chart');
  if (canHab) {
    const habDatasets = D.habits.map(h => {
      const clr = (typeof colMap !== 'undefined' && colMap[h.color]) ? colMap[h.color] : '#4f9eff';
      return {
        label: h.emoji + ' ' + h.name,
        data: days.map(d => (h.completed && h.completed[d] ? 1 : 0)),
        borderColor: clr,
        backgroundColor: clr + '22',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: clr,
        pointRadius: 2
      };
    });

    anaChs.push(new Chart(canHab, {
      type: 'line',
      data: {
        labels: days.map(d => d.slice(5)),
        datasets: habDatasets.length
          ? habDatasets
          : [{ label: 'No habits', data: days.map(() => 0), borderColor: '#4a5568', borderWidth: 1 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: D.habits.length > 0, labels: { color: tick, font: { size: 10 }, boxWidth: 10, padding: 6 } }
        },
        scales: {
          x: { ticks: { color: tick, font: { size: 9 }, maxRotation: 45, autoSkip: true }, grid: { color: grid } },
          y: { min: 0, max: 1.2, ticks: { color: tick, font: { size: 9 }, callback: v => (v === 0 ? '✗' : v === 1 ? '✓' : '') }, grid: { color: grid } }
        }
      }
    }));
  }

  // 3. Goals Progress %
  const canGoalP = document.getElementById('ana-goal-prog');
  if (canGoalP) {
    const goalCols = D.goals.map(g => (typeof tVarC !== 'undefined' ? tVarC[g.type] : '#4f9eff'));
    anaChs.push(new Chart(canGoalP, {
      type: 'bar',
      data: {
        labels: D.goals.map(g => (g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name)),
        datasets: [{
          data: D.goals.map(g => Math.round(Math.min(100, g.target > 0 ? g.progress / g.target * 100 : 0))),
          backgroundColor: goalCols.map(c => c + '99'),
          borderColor: goalCols,
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
          y: { min: 0, max: 100, ticks: { color: tick, font: { size: 9 }, callback: v => v + '%' }, grid: { color: grid } }
        }
      }
    }));
  }

  // 4. Goals Streak
  const canGoalS = document.getElementById('ana-goal-streak');
  if (canGoalS) {
    const goalCols = D.goals.map(g => (typeof tVarC !== 'undefined' ? tVarC[g.type] : '#4f9eff'));
    anaChs.push(new Chart(canGoalS, {
      type: 'bar',
      data: {
        labels: D.goals.map(g => (g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name)),
        datasets: [{
          data: D.goals.map(g => g.streak || 0),
          backgroundColor: goalCols.map(c => c + '88'),
          borderColor: goalCols,
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
          y: { ticks: { color: tick, font: { size: 9 }, callback: v => v + 'd' }, grid: { color: grid } }
        }
      }
    }));
  }

  // Summary Metrics
  const inc = D.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = D.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;

  const bEl = document.getElementById('ana-balance');
  if (bEl) {
    bEl.textContent = '₹' + Math.round(bal).toLocaleString('en-IN');
    bEl.style.color = bal >= 0 ? 'var(--green)' : 'var(--red)';
  }

  const today = todayStr();
  const habDone = D.habits.filter(h => h.completed && h.completed[today]).length;
  const habEl = document.getElementById('ana-habits');
  if (habEl) habEl.textContent = habDone + '/' + D.habits.length;

  const gDone = D.goals.filter(g => g.progress >= g.target).length;
  const goalEl = document.getElementById('ana-goals');
  if (goalEl) goalEl.textContent = gDone + '/' + D.goals.length;
}
