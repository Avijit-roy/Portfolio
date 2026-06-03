// src/frontend/patterns.ts
function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 1831565813;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, r | 61);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
var PatternRenderer = class {
  constructor(canvas) {
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.animationId = null;
    this.config = null;
    this.rng = Math.random;
    this.particles = [];
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Canvas 2D not supported");
    this.ctx = ctx;
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }
  onResize() {
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(300, Math.floor(rect.width));
    this.height = Math.max(150, Math.floor(rect.height));
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  async loadAndRender(config) {
    this.canvas.style.transition = "opacity 400ms ease";
    this.canvas.style.opacity = "0";
    await new Promise((r) => setTimeout(r, 200));
    this.config = config;
    this.rng = mulberry32(config.seed + 1);
    this.prepare(config);
    this.canvas.style.opacity = "1";
    this.start();
  }
  prepare(cfg) {
    cancelAnimationFrame(this.animationId ?? 0);
    this.particles = [];
    if (cfg.type === "particle-network" || cfg.type === "noise-field") {
      const count = Math.max(8, Math.floor(cfg.density * 220));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.rng() * this.width,
          y: this.rng() * this.height,
          vx: (this.rng() - 0.5) * 0.6 * (1 + cfg.complexity * 2),
          vy: (this.rng() - 0.5) * 0.6 * (1 + cfg.complexity * 2),
          r: 1 + Math.floor(this.rng() * 3 + cfg.complexity * 6)
        });
      }
    }
  }
  start() {
    if (!this.config)
      return;
    const loop = (t) => {
      this.step(t);
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }
  stop() {
    if (this.animationId)
      cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  step(time) {
    const cfg = this.config;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = cfg.palette[0] || "#0f172a";
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, this.width, this.height);
    if (cfg.type === "particle-network") {
      this.drawParticleNetwork(cfg, time);
    } else if (cfg.type === "geometric-grid") {
      this.drawGeometricGrid(cfg, time);
    } else if (cfg.type === "concentric-circles") {
      this.drawConcentric(cfg, time);
    } else if (cfg.type === "flowing-waves") {
      this.drawWaves(cfg, time);
    } else if (cfg.type === "voronoi") {
      this.drawVoronoi(cfg, time);
    } else if (cfg.type === "noise-field") {
      this.drawNoiseField(cfg, time);
    } else {
      this.drawGenerativeLines(cfg, time);
    }
  }
  drawParticleNetwork(cfg, time) {
    const ctx = this.ctx;
    const speed = 0.3 * cfg.animationSpeed;
    for (const p of this.particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (p.x < -10)
        p.x = this.width + 10;
      if (p.x > this.width + 10)
        p.x = -10;
      if (p.y < -10)
        p.y = this.height + 10;
      if (p.y > this.height + 10)
        p.y = -10;
    }
    const maxDist = 120 * (1 + cfg.complexity * 2);
    ctx.lineWidth = 1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.strokeStyle = this.mixColor(cfg.palette[1] || "#fff", cfg.palette[2] || "#fff", 0.5 + 0.5 * (1 - d / maxDist));
          ctx.globalAlpha = 0.12 + 0.6 * (1 - d / maxDist) * cfg.complexity;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const p of this.particles) {
      ctx.fillStyle = cfg.palette[2] || "#fff";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, Math.min(6, p.r)), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawGeometricGrid(cfg, time) {
    const ctx = this.ctx;
    const cols = Math.max(3, Math.floor(3 + cfg.density * 6));
    const rows = Math.max(2, Math.floor(2 + cfg.complexity * 4));
    const w = this.width / cols;
    const h = this.height / rows;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cx = x * w + w / 2;
        const cy = y * h + h / 2;
        const rot = Math.sin((time * 1e-3 + x + y) * (0.3 + cfg.complexity)) * 0.5;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = this.paletteColor(cfg, (x + y) % cfg.palette.length);
        ctx.globalAlpha = 0.9 - 0.5 * (1 - cfg.complexity);
        const size = Math.min(w, h) * (0.25 + cfg.complexity * 0.6);
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
  }
  drawConcentric(cfg, time) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rings = 6 + Math.floor(cfg.complexity * 10);
    for (let i = rings; i > 0; i--) {
      const r = Math.min(this.width, this.height) / 2 * (i / rings);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = this.paletteColor(cfg, i % cfg.palette.length);
      ctx.globalAlpha = 0.08 + 0.9 * (1 - i / rings) * cfg.complexity;
      ctx.fill();
    }
  }
  drawWaves(cfg, time) {
    const ctx = this.ctx;
    const bands = 3 + Math.floor(cfg.complexity * 6);
    for (let i = 0; i < bands; i++) {
      ctx.beginPath();
      const amp = 12 + cfg.density * 40 * (1 + i * 0.3);
      const speed = 2e-3 * cfg.animationSpeed * (1 + i * 0.2);
      ctx.moveTo(0, this.height / 2);
      for (let x = 0; x <= this.width; x += 10) {
        const y = this.height / 2 + Math.sin(x * 0.02 * (1 + cfg.complexity) + time * speed + i) * amp * Math.sin(i + cfg.complexity * 2);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fillStyle = this.paletteColor(cfg, i % cfg.palette.length);
      ctx.globalAlpha = 0.18 + 0.6 * (i / bands) * cfg.complexity;
      ctx.fill();
    }
  }
  drawVoronoi(cfg, time) {
    const ctx = this.ctx;
    const sites = 6 + Math.floor(cfg.density * 30);
    const siteList = [];
    for (let i = 0; i < sites; i++)
      siteList.push({ x: this.rng() * this.width, y: this.rng() * this.height, c: this.paletteColor(cfg, i % cfg.palette.length) });
    ctx.globalCompositeOperation = "lighter";
    for (const s of siteList) {
      const maxr = Math.max(this.width, this.height) * (0.4 + this.rng() * 0.6);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, maxr);
      g.addColorStop(0, this.hexToRgba(s.c, 0.9));
      g.addColorStop(1, this.hexToRgba(s.c, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, maxr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  drawNoiseField(cfg, time) {
    const ctx = this.ctx;
    const blocks = 30 + Math.floor(cfg.density * 120);
    for (let i = 0; i < blocks; i++) {
      const x = Math.floor(this.rng() * this.width);
      const y = Math.floor(this.rng() * this.height);
      const w = 20 + Math.floor(this.rng() * 80 * (1 + cfg.complexity));
      const h = 10 + Math.floor(this.rng() * 80 * (1 + cfg.complexity));
      ctx.fillStyle = this.paletteColor(cfg, Math.floor(this.rng() * cfg.palette.length));
      ctx.globalAlpha = 0.02 + 0.05 * this.rng() * cfg.complexity;
      ctx.fillRect(x, y, w, h);
    }
  }
  drawGenerativeLines(cfg, time) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.paletteColor(cfg, 1);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < Math.floor(20 + cfg.complexity * 200); i++) {
      const x = this.rng() * this.width;
      const y = this.rng() * this.height;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (this.rng() - 0.5) * 100, y + (this.rng() - 0.5) * 100);
    }
    ctx.globalAlpha = 0.14;
    ctx.stroke();
  }
  paletteColor(cfg, i) {
    return cfg.palette[i % cfg.palette.length];
  }
  mixColor(a, b, t) {
    const pa = this.hexToRgb(a);
    const pb = this.hexToRgb(b);
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    return `rgb(${r},${g},${bl})`;
  }
  hexToRgb(hex) {
    const c = hex.replace("#", "");
    const bigint = parseInt(c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c, 16);
    return { r: bigint >> 16 & 255, g: bigint >> 8 & 255, b: bigint & 255 };
  }
  hexToRgba(hex, a) {
    const c = this.hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
};
function initPatternUI() {
  const canvas = document.createElement("canvas");
  canvas.id = "pattern-canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.transition = "opacity 400ms ease";
  canvas.style.opacity = "1";
  const root = document.createElement("div");
  root.id = "pattern-root";
  root.style.position = "relative";
  root.style.width = "100%";
  root.style.height = "320px";
  root.style.overflow = "hidden";
  root.appendChild(canvas);
  const controls = document.createElement("div");
  controls.className = "pattern-controls";
  controls.style.position = "absolute";
  controls.style.right = "12px";
  controls.style.bottom = "12px";
  controls.style.zIndex = "50";
  const btn = document.createElement("button");
  btn.id = "btn-generate-pattern";
  btn.className = "btn";
  btn.textContent = "Generate New Pattern";
  controls.appendChild(btn);
  root.appendChild(controls);
  const hero = document.getElementById("hero");
  if (hero && hero.parentNode)
    hero.parentNode.insertBefore(root, hero.nextSibling);
  else
    document.body.insertBefore(root, document.body.firstChild);
  const renderer = new PatternRenderer(canvas);
  async function fetchAndRender(seed) {
    const url = "/api/pattern" + (seed ? `?seed=${seed}` : "");
    const resp = await fetch(url);
    const cfg = await resp.json();
    renderer.loadAndRender(cfg);
  }
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    await fetchAndRender();
    setTimeout(() => btn.disabled = false, 600);
  });
  fetchAndRender();
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", initPatternUI);
else
  initPatternUI();
window.PatternAPI = {
  renderInto: async (container, cfg) => {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.opacity = "1";
    container.innerHTML = "";
    container.appendChild(canvas);
    const renderer = new PatternRenderer(canvas);
    if (cfg)
      await renderer.loadAndRender(cfg);
    else {
      const resp = await fetch("/api/pattern");
      const data = await resp.json();
      await renderer.loadAndRender(data);
    }
    return renderer;
  }
};
