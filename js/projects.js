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

    const actionLink = repo.homepage
      ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="project-link">Live Demo ↗</a>`
      : `<a href="${repo.html_url}" target="_blank" rel="noopener" class="project-link">View on GitHub ↗</a>`;

    const imgSeed = encodeURIComponent(repo.name.toLowerCase());
    const imgUrl  = `https://picsum.photos/seed/${imgSeed}/800/380`;

    return `
      <article class="project-card reveal" id="dyn-project-${idx}">
        <div class="project-img-wrap">
          <img src="${imgUrl}" alt="${repo.name} preview" class="project-img project-img-photo" loading="lazy"
            onerror="this.style.background='linear-gradient(135deg,hsl(270,60%,11%),hsl(280,65%,14%))'" />
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
