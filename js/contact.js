/* js/contact.js — Contact form submit handler (Formspree AJAX) */
window.initContactForm = function (formOverride) {
  const form = formOverride || document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // ── Loading state ──────────────────────────────────────────
    btn.innerHTML = 'Sending… <span class="btn-arrow">⏳</span>';
    btn.disabled = true;

    // ── Collect form data ──────────────────────────────────────
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/mjgqklbp', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        // ── Success ──────────────────────────────────────────
        form.innerHTML = `
          <div style="
            padding: 3rem 1rem;
            text-align: center;
            color: var(--purple-1, #a855f7);
          ">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">
              Message sent!
            </div>
            <div style="font-size: 0.95rem; opacity: 0.7; color: var(--text-muted, #aaa);">
              Thanks for reaching out — I'll get back to you soon.
            </div>
          </div>`;
      } else {
        // ── Formspree returned an error ───────────────────────
        const json = await response.json();
        const errMsg =
          json?.errors?.map((err) => err.message).join(', ') ||
          'Something went wrong. Please try again.';
        showError(form, btn, originalHTML, errMsg);
      }
    } catch (_) {
      // ── Network / fetch error ─────────────────────────────
      showError(
        form,
        btn,
        originalHTML,
        'Network error — check your connection and try again.'
      );
    }
  });
};

function showError(form, btn, originalHTML, message) {
  // Re-enable button
  btn.innerHTML = originalHTML;
  btn.disabled = false;

  // Show error banner (remove old one first)
  const existing = form.querySelector('.fs-error-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.className = 'fs-error-banner';
  banner.style.cssText = `
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #f87171;
    font-size: 0.9rem;
    text-align: center;
  `;
  banner.textContent = '⚠️ ' + message;
  form.appendChild(banner);

  // Auto-remove after 6 seconds
  setTimeout(() => banner.remove(), 6000);
}

window.initContactForm();
