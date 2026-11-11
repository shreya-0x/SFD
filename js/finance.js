/**
 * SFD - Finance Management & Charts
 */

const catC = {
  'Food': '#f59e0b',
  'Travel': '#06b6d4',
  'Study': '#8b5cf6',
  'Entertainment': '#ec4899',
  'Health': '#22c55e',
  'Shopping': '#f97316',
  'Income': '#4f9eff'
};

const catI = {
  'Food': '🍔',
  'Travel': '🚌',
  'Study': '📚',
  'Entertainment': '🎮',
  'Health': '💊',
  'Shopping': '🛍',
  'Income': '💼'
};

let txnT = 'income';
let lCh = null;
let pCh = null;

function setType(t) {
  txnT = t;
  const btnInc = document.getElementById('btn-inc');
  const btnExp = document.getElementById('btn-exp');
  if (btnInc) btnInc.className = 'tb' + (t === 'income' ? ' ai' : '');
  if (btnExp) btnExp.className = 'tb' + (t === 'expense' ? ' ae' : '');
}

function addTxn() {
  const descInp = document.getElementById('td');
  const amtInp = document.getElementById('ta');
  const catInp = document.getElementById('tcat');
  const dtInp = document.getElementById('tdt');

  if (!descInp || !amtInp) return;

  const desc = descInp.value.trim();
  const amt = parseFloat(amtInp.value);
  const cat = catInp ? catInp.value : 'Income';
  const dt = (dtInp && dtInp.value) ? dtInp.value : todayStr();

  if (!desc) {
    toast('Enter a description', 'e');
    return;
  }
  if (!amt || amt <= 0) {
    toast('Enter a valid amount', 'e');
    return;
  }

  D.transactions.unshift({
    id: Date.now(),
    desc,
    amount: amt,
    type: txnT,
    category: cat,
    date: dt
  });

  save();
  descInp.value = '';
  amtInp.value = '';

  toast(txnT === 'income' ? 'Income added! 💰' : 'Expense added! 📝', 's');
  renderTxns();
  updateBal();
  initFinCharts();
}

function delTxn(id) {
  D.transactions = D.transactions.filter(t => t.id !== id);
  save();
  renderTxns();
  updateBal();
  initFinCharts();
  toast('Removed', 'i');
}

function updateBal() {
  const inc = D.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = D.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const b = inc - exp;

  const el = document.getElementById('bal');
  if (el) {
    el.textContent = '₹' + Math.round(b).toLocaleString('en-IN');
    el.className = 'bamt ' + (b >= 0 ? 'bpos' : 'bneg');
  }

  const tinc = document.getElementById('tinc');
  const texp = document.getElementById('texp');
  if (tinc) tinc.textContent = '₹' + Math.round(inc).toLocaleString('en-IN');
  if (texp) texp.textContent = '₹' + Math.round(exp).toLocaleString('en-IN');
}

function renderTxns() {
  const el = document.getElementById('tlist');
  const countEl = document.getElementById('txnc');
  if (countEl) countEl.textContent = D.transactions.length + ' items';
  if (!el) return;

  if (!D.transactions.length) {
    el.innerHTML = '<div class="es">💳 No transactions yet</div>';
    return;
  }

  el.innerHTML = D.transactions.slice(0, 20).map(t => `
    <div class="ti">
      <div class="tl">
        <div class="tic" style="background:${catC[t.category] || '#4f9eff'}22">
          ${catI[t.category] || '💰'}
        </div>
        <div>
          <div class="td2">${t.desc}</div>
          <div class="tc2">${t.category} · ${t.date}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem">
        <div class="ta2 ${t.type === 'income' ? 'tinc' : 'texp'}">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}
        </div>
        <button class="db" onclick="delTxn(${t.id})" title="Delete transaction">✕</button>
      </div>
    </div>
  `).join('');
}

function initFinCharts() {
  const canvasL = document.getElementById('lc2');
  const canvasP = document.getElementById('pc2');
  if (!canvasL || !canvasP) return;

  const days = get14Days();
  const { grid, tick } = chartColors();

  const incData = days.map(day => 
    D.transactions.filter(t => t.type === 'income' && t.date === day).reduce((s, t) => s + t.amount, 0)
  );
  const expData = days.map(day => 
    D.transactions.filter(t => t.type === 'expense' && t.date === day).reduce((s, t) => s + t.amount, 0)
  );

  if (lCh) lCh.destroy();
  lCh = new Chart(canvasL, {
    type: 'line',
    data: {
      labels: days.map(d => d.slice(5)),
      datasets: [
        {
          label: 'Income',
          data: incData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22c55e',
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Expenses',
          data: expData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: tick, font: { size: 9 }, maxRotation: 45, autoSkip: false },
          grid: { color: grid }
        },
        y: {
          ticks: { color: tick, font: { size: 10 }, callback: v => '₹' + Math.round(v) },
          grid: { color: grid }
        }
      }
    }
  });

  // Doughnut chart & custom legend
  const legEl = document.getElementById('pie-leg');
  const ct = {};
  D.transactions.filter(t => t.type === 'expense').forEach(t => {
    ct[t.category] = (ct[t.category] || 0) + t.amount;
  });

  const cats = Object.keys(ct);
  const vals = Object.values(ct);
  const cols = cats.map(c => catC[c] || '#4f9eff');

  if (pCh) pCh.destroy();

  if (!cats.length) {
    if (legEl) legEl.innerHTML = '<span style="color:var(--text3);font-size:.83rem">No expense data yet</span>';
    return;
  }

  const tot = vals.reduce((a, b) => a + b, 0);
  if (legEl) {
    legEl.innerHTML = cats.map((c, i) => `
      <span style="display:flex;align-items:center;gap:4px;color:var(--text2)">
        <span style="width:9px;height:9px;border-radius:2px;background:${cols[i]};flex-shrink:0"></span>
        ${c} ${Math.round(vals[i] / tot * 100)}%
      </span>
    `).join('');
  }

  pCh = new Chart(canvasP, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: cols.map(c => c + 'cc'),
        borderColor: cols,
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `₹${Math.round(ctx.raw).toLocaleString('en-IN')}`
          }
        }
      },
      cutout: '62%'
    }
  });
}

// Initial default date
document.addEventListener('DOMContentLoaded', () => {
  const tdt = document.getElementById('tdt');
  if (tdt) tdt.value = todayStr();
});
