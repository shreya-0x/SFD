/**
 * SFD - Interactive Particle Canvas Animation
 */

(function initParticles() {
  const cv = document.getElementById('pc');
  if (!cv) return;
  const cx = cv.getContext('2d');
  let pts = [];

  function rsz() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  rsz();
  window.addEventListener('resize', rsz);

  for (let i = 0; i < 75; i++) {
    pts.push({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      o: Math.random() * 0.5 + 0.1
    });
  }

  function animP() {
    cx.clearRect(0, 0, cv.width, cv.height);

    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > cv.width) p.vx *= -1;
      if (p.y < 0 || p.y > cv.height) p.vy *= -1;

      cx.beginPath();
      cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(79, 158, 255, ${p.o})`;
      cx.fill();
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 110) {
          cx.beginPath();
          cx.moveTo(pts[i].x, pts[i].y);
          cx.lineTo(pts[j].x, pts[j].y);
          cx.strokeStyle = `rgba(79, 158, 255, ${0.1 * (1 - d / 110)})`;
          cx.lineWidth = 0.5;
          cx.stroke();
        }
      }
    }

    if (typeof curPage === 'undefined' || curPage === 'landing') {
      requestAnimationFrame(animP);
    }
  }

  animP();
  window._animParticles = animP;
})();
