/**
 * SFD - Quotes Carousel & Motivation
 */

const QS = [
  { t: '"The secret of getting ahead is getting started."', a: '— Mark Twain' },
  { t: '"A budget is telling your money where to go instead of wondering where it went."', a: '— John C. Maxwell' },
  { t: '"Success is the sum of small efforts, repeated day in and day out."', a: '— Robert Collier' },
  { t: '"Do not save what is left after spending, but spend what is left after saving."', a: '— Warren Buffett' },
  { t: '"A goal without a plan is just a wish."', a: '— Antoine de Saint-Exupéry' },
  { t: '"You don\'t have to be great to start, but you have to start to be great."', a: '— Zig Ziglar' },
  { t: '"Beware of little expenses; a small leak will sink a great ship."', a: '— Benjamin Franklin' },
  { t: '"Discipline is the bridge between goals and accomplishment."', a: '— Jim Rohn' },
  { t: '"Your future self is watching you right now through memories."', a: '— Aubrey de Grey' },
  { t: '"An investment in knowledge pays the best interest."', a: '— Benjamin Franklin' },
  { t: '"The best time to plant a tree was 20 years ago. The second best time is now."', a: '— Chinese Proverb' },
  { t: '"Rich people have small TVs and big libraries. Poor people have small libraries and big TVs."', a: '— Zig Ziglar' }
];

let qi = 0;

function goQ(i) {
  qi = i;
  const t = document.getElementById('qt');
  const a = document.getElementById('qa');
  if (!t || !a) return;

  t.style.opacity = 0;
  setTimeout(() => {
    t.textContent = QS[i].t;
    a.textContent = QS[i].a;
    t.style.opacity = 1;
  }, 200);

  document.querySelectorAll('.qd').forEach((d, j) => d.classList.toggle('on', j === i));
}

(function initQuotes() {
  qi = Math.floor(Math.random() * QS.length);
  const qd = document.getElementById('qdots');
  const t = document.getElementById('qt');
  const a = document.getElementById('qa');

  if (qd) {
    qd.innerHTML = '';
    QS.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'qd' + (i === qi ? ' on' : '');
      d.onclick = () => goQ(i);
      qd.appendChild(d);
    });
  }

  if (t) t.textContent = QS[qi].t;
  if (a) a.textContent = QS[qi].a;

  setInterval(() => goQ((qi + 1) % QS.length), 5000);
})();
