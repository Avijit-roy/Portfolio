/* js/projects.js — Fetch starred repos & render project cards */
(function initFeaturedProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const USERNAME = 'Avijit-roy';

  function buildCard(repo, idx) {
    const desc = repo.description
      ? (repo.description.length > 115 ? repo.description.slice(0, 112) + '…' : repo.description)
      : 'No description provided.';

    const tags = (repo.topics && repo.topics.length)
      ? repo.topics.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')
      : `<span class="tag">${repo.name}</span>`;

    const actionText = repo.homepage ? 'Live Demo' : 'GitHub';
    const actionUrl = repo.homepage || repo.html_url;

    const actionLink = `
      <a href="${actionUrl}" target="_blank" rel="noopener" class="project-link-modern">
        <span class="action-text">${actionText}</span>
        <span class="action-arrow">→</span>
      </a>
    `;

    const seed = encodeURIComponent(repo.name.toLowerCase());

    return `
      <article class="project-card reveal" id="dyn-project-${idx}">
        <div class="project-img-wrap" data-seed="${seed}">
          <div class="project-canvas-placeholder" aria-hidden="true"></div>
          <div class="project-overlay">${actionLink}</div>
        </div>
        <div class="project-info">
          <div class="project-tags">${tags}</div>
          <h3 class="project-name">${repo.name}</h3>
          <p class="project-desc">${desc}</p>
        </div>
      </article>`;
  }

  fetch(`https://api.github.com/users/${USERNAME}/starred`)
    .then(r => r.json())
    .then(starred => {
      const allBtn = document.getElementById('btn-view-all-repos');
      if (allBtn) {
        allBtn.setAttribute('href', `https://github.com/${USERNAME}?tab=stars`);
        allBtn.innerHTML = `View all starred repositories on GitHub <span class="btn-arrow">↗</span>`;
      }

      if (!starred || !starred.length) {
        grid.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;grid-column:1/-1">No starred repos found.</p>`;
        return;
      }

      grid.innerHTML = starred.map((r, i) => buildCard(r, i)).join('');

      // Replace image placeholders with procedural pattern canvases
      window.renderProjectPatterns = function(container) {
        container.querySelectorAll('.project-img-wrap').forEach((wrap, i) => {
          const ph = wrap.querySelector('.project-canvas-placeholder');
          if (ph) ph.innerHTML = ''; // Clear prior canvas if re-rendered

          const seed = wrap.getAttribute('data-seed');
          const render = async () => {
            // If PatternAPI is not present yet, try to dynamically load the bundle
            if (!(window).PatternAPI) {
              try {
                await new Promise((resolve, reject) => {
                  const s = document.createElement('script');
                  s.src = '/js/patterns.js';
                  s.type = 'module';
                  s.onload = () => resolve(null);
                  s.onerror = () => reject(new Error('Failed to load patterns.js'));
                  document.head.appendChild(s);
                });
              } catch (err) {
                // Couldn't load renderer — fallback
                if (ph) ph.style.background = 'linear-gradient(135deg,hsl(270,60%,11%),hsl(280,65%,14%))';
                return;
              }
            }

            const api = (window).PatternAPI;
            if (!api || !api.renderInto) {
              if (ph) ph.style.background = 'linear-gradient(135deg,hsl(270,60%,11%),hsl(280,65%,14%))';
              return;
            }

            try {
              const resp = await fetch('/api/pattern?seed=' + encodeURIComponent(seed));
              if (!resp.ok) throw new Error('API error');
              const cfg = await resp.json();
              await api.renderInto(ph, cfg);
            } catch (e) {
              // API unavailable: generate a local config and render it
              const types = ['particle-network','geometric-grid','flowing-waves','voronoi','noise-field','concentric-circles','generative-line-art','polygon-mesh'];
              const palettes = [
                ['#9D5EFF', '#4ECDC4', '#ffffff'],
                ['#7B2FFF', '#FF6BD6', '#1a0033'],
                ['#00D4FF', '#6C63FF', '#000d1a'],
                ['#FF6BD6', '#9D5EFF', '#0d0022'],
                ['#4ECDC4', '#00D4FF', '#001a1a'],
                ['#6C63FF', '#FF6B6B', '#0a001a']
              ];
              const hash = (str) => {
                let h = 2166136261 >>> 0;
                for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
                return h >>> 0;
              };
              const s = seed || String(Math.random());
              const numeric = hash(s);
              const cfg = {
                seed: numeric,
                type: types[numeric % types.length],
                palette: palettes[numeric % palettes.length],
                density: 0.4 + ((numeric % 100) / 100) * 0.6,
                complexity: 0.2 + ((numeric >> 8) % 100) / 100 * 0.8,
                animationSpeed: 0.6 + ((numeric >> 16) % 300) / 100
              };
              try { await api.renderInto(ph, cfg); }
              catch { if (ph) ph.style.background = 'linear-gradient(135deg,hsl(270,60%,11%),hsl(280,65%,14%))'; }
            }
          };
          render();
        });
      };

      window.renderProjectPatterns(grid);

      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      grid.querySelectorAll('.reveal').forEach(c => io.observe(c));
    })
    .catch(() => {
      grid.innerHTML = `<div class="project-card" style="grid-column:1/-1"><div class="project-info" style="padding:2rem;text-align:center;">
        <p style="color:var(--text-muted)">Could not load repos. <a href="https://github.com/${USERNAME}?tab=stars" target="_blank" style="color:var(--purple-1)">View on GitHub ↗</a></p>
      </div></div>`;
    });
})();

// Scroll reveal for static elements
(function initReveal() {
  const targets = document.querySelectorAll('.stat-card, .skill-item, .about-text, .section-header, .contact-form');
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
})();
