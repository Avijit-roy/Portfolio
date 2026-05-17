/* js/stars.js — Starfield canvas with parallax, drag, shooting stars
   PERF: reduced star count, capped to 30fps, paused when tab hidden,
         expensive radial glows throttled to large stars only */
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx    = canvas.getContext('2d', { alpha: true });
  let W = window.innerWidth, H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap DPR

  let mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
  let isDragging = false, prevX = 0, prevY = 0;
  let dragX = 0, dragY = 0, targetDragX = 0, targetDragY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const IGNORE = 'a, button, input, textarea, .project-card, .stat-card, .skill-item, .contact-form, .navbar, .gh-profile-card';
  window.addEventListener('mousedown', e => {
    if (e.target.closest(IGNORE)) return;
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    targetDragX += e.clientX - prevX;
    targetDragY += e.clientY - prevY;
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('touchstart', e => {
    if (e.target.closest(IGNORE)) return;
    if (e.touches.length > 0) { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length === 0) return;
    targetDragX += e.touches[0].clientX - prevX;
    targetDragY += e.touches[0].clientY - prevY;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma != null) mouseX = Math.max(-1, Math.min(1, e.gamma / 30));
      if (e.beta  != null) mouseY = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
    });
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  // PERF: reduced counts significantly (was 160/80/30 = 270 total, now 100/50/20 = 170)
  const LAYERS = [
    { count: 100, rMin: 0.2, rMax: 0.7,  parallax: 18, speed: 0.003, alphaMax: 0.5,  color: '200,200,255' },
    { count: 50,  rMin: 0.6, rMax: 1.2,  parallax: 40, speed: 0.005, alphaMax: 0.75, color: '220,210,255' },
    { count: 20,  rMin: 1.0, rMax: 2.0,  parallax: 75, speed: 0.008, alphaMax: 1.0,  color: '255,255,255' },
  ];
  let layers = [];

  function createStars() {
    layers = LAYERS.map(cfg => {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        stars.push({
          bx: Math.random(), by: Math.random(),
          r: Math.random() * (cfg.rMax - cfg.rMin) + cfg.rMin,
          phase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.00008,
          vy: (Math.random() - 0.5) * 0.00008,
        });
      }
      return { cfg, stars };
    });
  }

  let shooters = [];
  function spawnShooter() {
    if (Math.random() > 0.003) return; // slightly less frequent
    shooters.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vx: 4 + Math.random() * 5, vy: 2 + Math.random() * 3, len: 60 + Math.random() * 80, life: 1.0 });
  }

  // Tab-hidden gate
  let tabVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });

  // Frame-rate cap: target 30fps for stars (canvas 2D is cheaper than WebGL so 30 is fine)
  const FRAME_MS = 1000 / 30;
  let lastTime = 0;
  let t = 0;

  function draw(now) {
    requestAnimationFrame(draw);
    if (!tabVisible) return;                    // pause when tab hidden
    if (now - lastTime < FRAME_MS) return;      // throttle to 30fps
    lastTime = now;

    t += 0.012;
    smoothX += (mouseX - smoothX) * 0.05;
    smoothY += (mouseY - smoothY) * 0.05;
    dragX += (targetDragX - dragX) * 0.08;
    dragY += (targetDragY - dragY) * 0.08;
    ctx.clearRect(0, 0, W, H);

    layers.forEach(({ cfg, stars }) => {
      const offsetX = smoothX * cfg.parallax + dragX * (cfg.parallax / 40);
      const offsetY = smoothY * cfg.parallax + dragY * (cfg.parallax / 40);
      stars.forEach(s => {
        s.bx = (s.bx + s.vx + 1) % 1;
        s.by = (s.by + s.vy + 1) % 1;
        let sx = ((s.bx * W + offsetX) % (W + 40) + W + 40) % (W + 40) - 20;
        let sy = ((s.by * H + offsetY) % (H + 40) + H + 40) % (H + 40) - 20;
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * cfg.speed * 55 + s.phase));
        const alpha   = twinkle * cfg.alphaMax;

        // PERF: radial glow only for the largest stars (r > 1.4), skips the cheap ones
        if (s.r > 1.4) {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.5);
          grad.addColorStop(0,   `rgba(${cfg.color},${alpha})`);
          grad.addColorStop(0.4, `rgba(${cfg.color},${alpha * 0.3})`);
          grad.addColorStop(1,   `rgba(${cfg.color},0)`);
          ctx.beginPath(); ctx.arc(sx, sy, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cfg.color},${alpha})`; ctx.fill();
      });
    });

    spawnShooter();
    shooters = shooters.filter(s => s.life > 0);
    shooters.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.025;
      const tail = { x: s.x - s.vx * (s.len / s.vx), y: s.y - s.vy * (s.len / s.vx) };
      const grad = ctx.createLinearGradient(tail.x, tail.y, s.x, s.y);
      grad.addColorStop(0,   'rgba(255,255,255,0)');
      grad.addColorStop(0.7, `rgba(200,160,255,${s.life * 0.6})`);
      grad.addColorStop(1,   `rgba(255,255,255,${s.life})`);
      ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }

  resize(); createStars(); requestAnimationFrame(draw);
  window.addEventListener('resize', () => { resize(); createStars(); });
})();
