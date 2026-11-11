/**
 * SFD - PDF Report Generation using jsPDF
 */

async function exportPDF() {
  const btn = document.getElementById('pdf-btn');
  const btnText = document.getElementById('pdf-btn-text');
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Generating...';

  try {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('jsPDF library is not loaded');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;
    let y = 0;

    // Dark Theme Colors
    const C = {
      bg:       [6, 10, 15],
      bg2:      [11, 17, 24],
      bg3:      [16, 24, 32],
      card:     [20, 30, 42],
      border:   [30, 48, 64],
      neon:     [16, 217, 160],
      purple:   [162, 89, 255],
      gold:     [245, 166, 35],
      green:    [34, 197, 94],
      red:      [240, 79, 94],
      text:     [220, 240, 232],
      text2:    [100, 150, 130],
      text3:    [50, 80, 65],
      white:    [255, 255, 255]
    };

    const s = v => (v === null || v === undefined) ? '' : String(v);

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const userName = s(user ? user.name : 'Student');
    const reportDate = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    function newPage() {
      doc.addPage();
      doc.setFillColor(...C.bg);
      doc.rect(0, 0, W, 297, 'F');
      doc.setFillColor(...C.neon);
      doc.rect(0, 0, 4, 297, 'F');
      y = 18;
    }

    function chk(h) {
      if (y + h > 278) newPage();
    }

    function sectionBar(title, color) {
      title = s(title);
      chk(14);
      doc.setFillColor(...color.map(c => Math.round(c * 0.25)));
      doc.rect(M, y, W - M * 2, 10, 'F');
      doc.setFillColor(...color);
      doc.rect(M, y, 3, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...color);
      doc.text(title.toUpperCase(), M + 7, y + 7);
      y += 14;
    }

    function statBox(x, bw, bh, label, value, col) {
      value = s(value);
      label = s(label);
      doc.setFillColor(...C.card);
      doc.roundedRect(x, y, bw, bh, 2, 2, 'F');
      doc.setDrawColor(...col);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, bw, bh, 2, 2, 'S');
      doc.setFillColor(...col);
      doc.roundedRect(x, y, bw, 1.5, 0.5, 0.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...col);
      doc.text(String(value), x + bw / 2, y + bh * 0.52, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.text2);
      doc.text(label, x + bw / 2, y + bh - 3.5, { align: 'center' });
    }

    function progressRow(label, pct, col, sub) {
      chk(13);
      const barX = M + 4, barY = y + 6, barW = W - M * 2 - 8, barH = 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.text);
      doc.text(s(label).length > 36 ? s(label).slice(0, 34) + '...' : s(label), barX, y + 4);
      if (sub) {
        doc.setFontSize(7);
        doc.setTextColor(...C.text2);
        doc.text(s(sub), barX, y + 4 + 4.5);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...col);
      doc.text(Math.round(pct) + '%', W - M - 4, y + 4, { align: 'right' });

      doc.setFillColor(...C.bg3);
      doc.roundedRect(barX, barY, barW, barH, 1, 1, 'F');

      const fill = Math.max(0, Math.min(1, pct / 100)) * barW;
      if (fill > 0) {
        doc.setFillColor(...col);
        doc.roundedRect(barX, barY, fill, barH, 1, 1, 'F');
        doc.setFillColor(...col.map(c => Math.min(255, c + 80)));
        doc.circle(barX + fill, barY + barH / 2, 1.5, 'F');
      }
      y += sub ? 17 : 14;
    }

    function sep() {
      chk(4);
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      doc.line(M, y, W - M, y);
      y += 4;
    }

    // ===================== COVER PAGE =====================
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, 297, 'F');

    doc.setFillColor(...C.neon);
    doc.rect(0, 0, W, 3, 'F');
    doc.setFillColor(...C.neon);
    doc.rect(0, 294, W, 3, 'F');

    doc.setFillColor(16, 40, 30);
    doc.rect(0, 0, 8, 297, 'F');
    doc.setFillColor(...C.neon);
    doc.rect(0, 0, 3, 297, 'F');

    doc.setFillColor(10, 18, 14);
    doc.rect(8, 3, W - 8, 110, 'F');

    doc.setDrawColor(...C.neon);
    doc.setLineWidth(0.3);
    doc.line(25, 28, W - 15, 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(52);
    doc.setTextColor(...C.neon);
    doc.text('SFD', W / 2, 70, { align: 'center' });

    const uW = 48, uX = W / 2 - uW / 2;
    doc.setFillColor(...C.neon);
    doc.rect(uX, 74, uW, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.text);
    doc.text('STUDENT FINANCIAL DASHBOARD', W / 2, 84, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text('Personal Progress Report', W / 2, 92, { align: 'center' });

    doc.setDrawColor(...C.neon.map(c => Math.round(c * 0.3)));
    doc.setLineWidth(0.3);
    doc.line(25, 100, W - 15, 100);

    // User info card
    doc.setFillColor(14, 24, 18);
    doc.roundedRect(25, 112, W - 50, 34, 3, 3, 'F');
    doc.setFillColor(...C.neon);
    doc.roundedRect(25, 112, W - 50, 2, 1, 1, 'F');
    doc.setDrawColor(...C.neon.map(c => Math.round(c * 0.4)));
    doc.setLineWidth(0.4);
    doc.roundedRect(25, 112, W - 50, 34, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...C.white);
    doc.text(s(userName), W / 2, 126, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text(s(user ? user.email : ''), W / 2, 134, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text(s(reportDate) + '   |   ' + s(now), W / 2, 155, { align: 'center' });

    const dateTextW = doc.getTextWidth(reportDate + '   |   ' + now);
    doc.setFillColor(...C.neon);
    doc.circle(W / 2 - dateTextW / 2 - 4, 152.5, 1, 'F');
    doc.circle(W / 2 + dateTextW / 2 + 4, 152.5, 1, 'F');

    // Contents panel
    doc.setFillColor(11, 20, 15);
    doc.roundedRect(20, 165, W - 40, 95, 3, 3, 'F');
    doc.setDrawColor(25, 50, 36);
    doc.setLineWidth(0.4);
    doc.roundedRect(20, 165, W - 40, 95, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.neon);
    doc.text('REPORT CONTAINS', W / 2, 175, { align: 'center' });

    doc.setDrawColor(...C.neon.map(c => Math.round(c * 0.3)));
    doc.setLineWidth(0.2);
    doc.line(35, 178, W - 35, 178);

    const secRows = [
      { num: '01', title: 'FINANCE', sub: 'Income & Expenses  |  Category Breakdown  |  Transactions', col: C.green },
      { num: '02', title: 'HABITS',  sub: 'Completion Rates  |  Streaks  |  14-Day Calendar Grid',     col: C.purple },
      { num: '03', title: 'GOALS',   sub: 'Progress Details  |  Milestones  |  Streak Leaderboard',    col: C.gold }
    ];

    secRows.forEach((item, i) => {
      const ry = 184 + i * 26;
      doc.setFillColor(...item.col.map(c => Math.round(c * 0.08)));
      doc.roundedRect(28, ry, W - 56, 20, 2, 2, 'F');
      doc.setFillColor(...item.col);
      doc.roundedRect(28, ry, 3, 20, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...item.col.map(c => Math.round(c * 0.4)));
      doc.text(item.num, 38, ry + 13.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...item.col);
      doc.text(item.title, 52, ry + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.text2);
      doc.text(item.sub, 52, ry + 16);
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.text3);
    doc.text('Generated by SFD Dashboard  |  For personal use only', W / 2, 287, { align: 'center' });

    // ===================== PAGE 2 — FINANCE =====================
    newPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...C.neon);
    doc.text('FINANCE REPORT', M + 6, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text('Income, expenses and transaction history', M + 6, y);
    y += 8;
    sep();

    const inc = D.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = D.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const bal = inc - exp;

    const bw3 = (W - M * 2 - 8) / 3;
    const bh3 = 22;
    statBox(M,               bw3, bh3, 'TOTAL INCOME',   'Rs.' + Math.round(inc).toLocaleString('en-IN'), C.green);
    statBox(M + bw3 + 4,     bw3, bh3, 'TOTAL EXPENSES', 'Rs.' + Math.round(exp).toLocaleString('en-IN'), C.red);
    statBox(M + (bw3 + 4)*2, bw3, bh3, 'NET BALANCE',    'Rs.' + Math.round(Math.abs(bal)).toLocaleString('en-IN') + (bal < 0 ? ' (-)' : ''), bal >= 0 ? C.neon : C.red);
    y += bh3 + 10;

    sectionBar('Spending by Category', C.purple);
    const catT = {};
    D.transactions.filter(t => t.type === 'expense').forEach(t => {
      catT[t.category] = (catT[t.category] || 0) + t.amount;
    });
    const totExp = Object.values(catT).reduce((a, b) => a + b, 0);
    if (!Object.keys(catT).length) {
      doc.setFontSize(8);
      doc.setTextColor(...C.text2);
      doc.text('No expense data recorded.', M + 4, y);
      y += 8;
    } else {
      Object.entries(catT).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
        const pct = totExp ? (amt / totExp) * 100 : 0;
        progressRow(s(cat), pct, C.purple, 'Rs.' + Math.round(amt).toLocaleString('en-IN'));
      });
    }

    sectionBar('Recent Transactions', C.neon);
    const txns = D.transactions.slice(0, 15);
    if (!txns.length) {
      doc.setFontSize(8);
      doc.setTextColor(...C.text2);
      doc.text('No transactions recorded.', M + 4, y);
      y += 8;
    } else {
      doc.setFillColor(...C.bg3);
      doc.rect(M, y, W - M * 2, 8, 'F');
      doc.setFillColor(...C.neon);
      doc.rect(M, y, W - M * 2, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.text2);
      ['DATE', 'DESCRIPTION', 'CATEGORY', 'AMOUNT'].forEach((h, i) => {
        const xs = [M + 3, M + 30, M + 105, W - M - 3];
        const aligns = ['left', 'left', 'left', 'right'];
        doc.text(h, xs[i], y + 5.5, { align: aligns[i] });
      });
      y += 10;

      txns.forEach((t, i) => {
        chk(8);
        if (i % 2 === 0) {
          doc.setFillColor(...C.card);
          doc.rect(M, y - 1, W - M * 2, 8, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.text2);
        doc.text(s(t.date), M + 3, y + 4.5);
        doc.setTextColor(...C.text);
        doc.text(s(t.desc || '').length > 28 ? s(t.desc).slice(0, 26) + '..' : s(t.desc), M + 30, y + 4.5);
        doc.setTextColor(...C.text2);
        doc.text(s(t.category), M + 105, y + 4.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(t.type === 'income' ? C.green : C.red));
        doc.text((t.type === 'income' ? '+' : '-') + 'Rs.' + s(t.amount ? t.amount.toLocaleString('en-IN') : '0'), W - M - 3, y + 4.5, { align: 'right' });
        y += 8;
      });
    }

    // ===================== PAGE 3 — HABITS =====================
    newPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...C.purple);
    doc.text('HABIT TRACKER REPORT', M + 6, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text('Consistency, streaks and 14-day history', M + 6, y);
    y += 8;
    sep();

    const today = todayStr();
    const dates14 = get14Days();
    const habDone = D.habits.filter(h => h.completed && h.completed[today]).length;
    const totHab = D.habits.length;
    const habPct = totHab ? Math.round(habDone / totHab * 100) : 0;

    const bw2 = (W - M * 2 - 4) / 2;
    statBox(M,          bw2, 20, 'TOTAL HABITS', totHab, C.purple);
    statBox(M + bw2 + 4, bw2, 20, 'DONE TODAY',   habDone + ' / ' + totHab, habPct === 100 ? C.green : C.gold);
    y += 30;

    if (!D.habits.length) {
      doc.setFontSize(9);
      doc.setTextColor(...C.text2);
      doc.text('No habits recorded yet.', M + 4, y);
      y += 10;
    } else {
      sectionBar('Habit Completion Rates (Last 14 Days)', C.purple);
      const colMap2 = {
        neon: C.neon,
        neon2: C.purple,
        neon3: C.gold,
        green: C.green,
        amber: C.gold,
        pink: [255, 110, 180]
      };

      D.habits.forEach(h => {
        const d14 = dates14.filter(d => h.completed && h.completed[d]).length;
        const pct = Math.round(d14 / 14 * 100);
        const streak = typeof getStreak === 'function' ? getStreak(h) : 0;
        const col = colMap2[h.color] || C.neon;
        progressRow(s(h.name), pct, col, d14 + '/14 days  |  streak: ' + s(streak) + 'd');
      });

      chk(12 + D.habits.length * 9);
      sectionBar('14-Day Completion Calendar', C.neon);

      const cellW = (W - M * 2 - 40) / 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...C.text2);
      dates14.forEach((d, i) => {
        doc.text(d.slice(8), M + 40 + i * cellW + cellW / 2, y + 3.5, { align: 'center' });
      });

      dates14.forEach((d, i) => {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const m = months[parseInt(d.slice(5, 7)) - 1];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(...C.text3);
        doc.text(m, M + 40 + i * cellW + cellW / 2, y + 7, { align: 'center' });
      });
      y += 11;

      D.habits.forEach(h => {
        chk(9);
        const col = colMap2[h.color] || C.neon;
        doc.setFillColor(...C.card);
        doc.roundedRect(M, y, W - M * 2, 7.5, 1, 1, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...C.text);
        const nameLabel = h.name.length > 14 ? h.name.slice(0, 12) + '..' : h.name;
        doc.text(s(nameLabel), M + 3, y + 5);

        dates14.forEach((d, i) => {
          const done = h.completed && h.completed[d];
          const cx = M + 40 + i * cellW + 0.8;
          const cy = y + 1;
          const cw = cellW - 1.6;
          const ch = 5.5;
          if (done) {
            doc.setFillColor(...col);
            doc.roundedRect(cx, cy, cw, ch, 0.8, 0.8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(4.5);
            doc.setTextColor(6, 10, 15);
            doc.text('v', cx + cw / 2, cy + ch - 1, { align: 'center' });
          } else {
            doc.setFillColor(...C.bg3);
            doc.roundedRect(cx, cy, cw, ch, 0.8, 0.8, 'F');
          }
        });

        const streak = typeof getStreak === 'function' ? getStreak(h) : 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...C.gold);
        doc.text(s(streak) + 'd', W - M - 2, y + 5, { align: 'right' });
        y += 9;
      });

      y += 3;
      doc.setFillColor(...C.neon);
      doc.roundedRect(M + 4, y, 8, 4, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.text2);
      doc.text('Done', M + 15, y + 3.5);
      doc.setFillColor(...C.bg3);
      doc.roundedRect(M + 30, y, 8, 4, 0.8, 0.8, 'F');
      doc.text('Not done', M + 41, y + 3.5);
      doc.setTextColor(...C.gold);
      doc.text('Streak days shown on right', M + 70, y + 3.5);
      y += 10;
    }

    // ===================== PAGE 4 — GOALS =====================
    newPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...C.gold);
    doc.text('GOALS REPORT', M + 6, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text('Progress, milestones and streak leaderboard', M + 6, y);
    y += 8;
    sep();

    const totalG = D.goals.length;
    const doneG = D.goals.filter(g => g.progress >= g.target).length;
    const bestStreak = D.goals.reduce((m, g) => Math.max(m, g.streak || 0), 0);
    const avgPct = totalG ? Math.round(D.goals.reduce((sum, g) => sum + Math.min(100, g.target > 0 ? g.progress / g.target * 100 : 0), 0) / totalG) : 0;

    const bw4 = (W - M * 2 - 12) / 4;
    const bh4 = 20;
    statBox(M,               bw4, bh4, 'TOTAL GOALS',  totalG,         C.neon);
    statBox(M + (bw4 + 4),   bw4, bh4, 'COMPLETED',    doneG,          C.green);
    statBox(M + (bw4 + 4)*2, bw4, bh4, 'BEST STREAK',  bestStreak + 'd', C.gold);
    statBox(M + (bw4 + 4)*3, bw4, bh4, 'AVG PROGRESS', avgPct + '%',   C.purple);
    y += bh4 + 10;

    if (!D.goals.length) {
      doc.setFontSize(9);
      doc.setTextColor(...C.text2);
      doc.text('No goals recorded yet.', M + 4, y);
      y += 10;
    } else {
      const typeColors = { financial: C.green, personal: C.neon, purchase: C.gold };
      const typeLabel  = { financial: 'FINANCIAL', personal: 'PERSONAL', purchase: 'PURCHASE' };

      sectionBar('Goal Progress Details', C.gold);
      D.goals.forEach(g => {
        chk(36);
        const pct = Math.min(100, g.target > 0 ? Math.round(g.progress / g.target * 100) : 0);
        const col = typeColors[g.type] || C.neon;
        const isRupee = g.type === 'financial' || g.type === 'purchase';
        const fmt = v => (isRupee ? 'Rs.' : '') + Math.round(v * 100) / 100;
        const isComplete = g.progress >= g.target;

        doc.setFillColor(...C.card);
        doc.roundedRect(M, y, W - M * 2, 32, 2, 2, 'F');
        doc.setDrawColor(...col.map(c => Math.round(c * 0.5)));
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, W - M * 2, 32, 2, 2, 'S');

        doc.setFillColor(...col);
        doc.roundedRect(M, y, W - M * 2, 1.5, 0.5, 0.5, 'F');

        doc.setFillColor(...col.map(c => Math.round(c * 0.2)));
        doc.roundedRect(M + 3, y + 4, 22, 6, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(...col);
        doc.text(typeLabel[g.type] || g.type.toUpperCase(), M + 14, y + 8.3, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...C.white);
        doc.text(s(g.name).length > 38 ? s(g.name).slice(0, 36) + '..' : s(g.name), M + 28, y + 9.5);

        if (isComplete) {
          doc.setFillColor(...C.green);
          doc.roundedRect(W - M - 22, y + 4, 19, 6, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(6, 10, 15);
          doc.text('COMPLETED', W - M - 12.5, y + 8.3, { align: 'center' });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.text2);
        doc.text('Saved:', M + 4, y + 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.text);
        doc.text(s(fmt(g.progress)), M + 18, y + 18);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.text2);
        doc.text('Target:', M + 55, y + 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.text);
        doc.text(s(fmt(g.target)), M + 70, y + 18);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.text2);
        doc.text('Streak:', M + 105, y + 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.gold);
        doc.text(s(g.streak || 0) + ' days', M + 119, y + 18);

        if (g.deadline) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...C.text2);
          doc.text('Due: ' + s(g.deadline), W - M - 4, y + 18, { align: 'right' });
        }

        const pbY = y + 22, pbX = M + 4, pbW = W - M * 2 - 8, pbH = 4;
        doc.setFillColor(...C.bg2);
        doc.roundedRect(pbX, pbY, pbW, pbH, 1, 1, 'F');
        const fill = Math.max(0, Math.min(1, pct / 100)) * pbW;
        if (fill > 0) {
          doc.setFillColor(...col);
          doc.roundedRect(pbX, pbY, fill, pbH, 1, 1, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...col);
        doc.text(pct + '%', W - M - 4, y + 29, { align: 'right' });

        if (g.note) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.5);
          doc.setTextColor(...C.text3);
          doc.text('"' + s(s(g.note).length > 60 ? s(g.note).slice(0, 58) + '..' : g.note) + '"', M + 4, y + 29);
        }
        y += 36;
      });

      chk(14);
      y += 4;
      sectionBar('Streak Leaderboard', C.purple);
      const sorted = [...D.goals].sort((a, b) => (b.streak || 0) - (a.streak || 0));
      sorted.forEach((g, i) => {
        chk(10);
        const medals = ['#1', '#2', '#3'];
        const mColors = [C.gold, [180, 180, 180], [200, 140, 100]];
        const mCol = mColors[i] || C.text2;

        doc.setFillColor(...(i % 2 === 0 ? C.card : C.bg2));
        doc.roundedRect(M, y, W - M * 2, 8.5, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...mCol);
        doc.text(medals[i] || ('#' + (i + 1)), M + 5, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.text);
        doc.text(s(g.name).length > 38 ? s(g.name).slice(0, 36) + '..' : s(g.name), M + 18, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.gold);
        doc.text(s(g.streak || 0) + ' days', W - M - 4, y + 6, { align: 'right' });
        y += 10;
      });
    }

    // ===================== PAGE FOOTERS =====================
    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFillColor(...C.bg2);
      doc.rect(0, 287, W, 10, 'F');
      doc.setFillColor(...C.neon);
      doc.rect(0, 287, 4, 10, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.text2);
      if (p === 1) {
        doc.text('SFD Dashboard  |  Generated ' + reportDate, W / 2, 293.5, { align: 'center' });
      } else {
        doc.text('SFD Dashboard  |  ' + s(userName) + '  |  ' + s(reportDate), M + 8, 293.5);
        doc.setTextColor(...C.neon);
        doc.text('Page ' + p + ' of ' + pages, W - M, 293.5, { align: 'right' });
      }
    }

    const fileName = 'SFD_Report_' + userName.replace(/\s+/g, '_') + '_' + todayStr() + '.pdf';
    doc.save(fileName);
    toast('PDF report downloaded!', 's');
  } catch (err) {
    console.error('PDF export error:', err);
    toast('PDF generation failed: ' + err.message, 'e');
  }

  if (btn) btn.disabled = false;
  if (btnText) btnText.textContent = '📄 Export PDF Report';
}
