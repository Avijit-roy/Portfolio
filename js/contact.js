/* js/contact.js — Contact form submit handler */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success show" style="padding:3rem 1rem; color:var(--purple-1); font-size:1.1rem; font-weight:700; text-align:center;">
          <div style="font-size:3rem; margin-bottom:1rem;">🚀</div>
          Message sent! I'll get back to you soon.
        </div>`;
    }, 1200);
  });
})();
