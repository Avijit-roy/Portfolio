/* js/references.js — Interactive Reference Testimonials Slider */
window.initReferencesSlider = function(containerOverride) {
  const container = containerOverride || document.getElementById('references-slider-container');
  if (!container) return;

  // Cleanup old instance if exists on this specific container
  if (container._sliderCleanup) {
    container._sliderCleanup();
  }

  const REVIEWS = [
    {
      text: "Avijit brought incredible creativity to our IoT dashboard project. His ability to blend 3D Three.js visualizations with live MQTT sensor streams completely transformed how our users interact with physical data. A absolute marvel of a developer!",
      title: "Senior Product Manager, AgroTech Solutions"
    },
    {
      text: "Working with Avijit on our real-time social web application was a breeze. He designed an elegant, responsive React/Node infrastructure that handles low-latency events and live chat effortlessly. His eye for high-fidelity animations is outstanding.",
      title: "Lead Architect, Picsta Social Media"
    },
    {
      text: "Exceptional problem-solving skills! Avijit refactored a complex, legacy monolithic frontend into highly optimized modular components, dramatically improving team velocity and performance. A clean code champion!",
      title: "CTO, Digital Horizons"
    },
    {
      text: "Avijit possesses a unique combination of deep learning expertise and web engineering. He implemented a fully functional plant disease classification model in TensorFlow and seamlessly integrated it with a high-performance backend. Inspiring talent!",
      title: "Research Lead, AI CropGuard"
    },
    {
      text: "The level of care and aesthetic polish Avijit puts into his work is rare. He redesigned our entire portfolio and developer profile to feel incredibly premium, responsive, and interactive. Highly recommended for any creative engineering work!",
      title: "Creative Director, PixelLabs Studio"
    },
    {
      text: "Avijit is a brilliant, self-driven engineer who consistently pushes boundary limits. Whether it's hardware integrations with systems-level C coding or building immersive, fluid frontend UI designs, he delivers outstanding quality.",
      title: "Principal Engineer, HardwareLabs"
    }
  ];

  const FALLBACK_PEOPLE = [
    { name: "Sarah Jenkins", pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "David Chen", pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { name: "Emma Rodriguez", pic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
    { name: "Marcus Thompson", pic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    { name: "Sophia Martinez", pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
    { name: "Alex Kaczmarek", pic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" }
  ];

  function renderSlider(people) {
    const slidesHtml = REVIEWS.map((rev, i) => {
      const person = people[i] || FALLBACK_PEOPLE[i];
      return `
        <div class="reference-card">
          <span class="ref-quote-icon">“</span>
          <p class="ref-text">"${rev.text}"</p>
          <div class="ref-author">
            <img class="ref-avatar" src="${person.pic}" alt="${person.name} photo" loading="lazy" />
            <div class="ref-info">
              <span class="ref-name">${person.name}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    const dotsHtml = REVIEWS.map((_, i) => `<span class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('');

    container.innerHTML = `
      <div class="slider-viewport">
        <div class="slider-track">
          ${slidesHtml}
        </div>
      </div>
      <div class="slider-controls">
        <button class="slider-btn btn-prev" aria-label="Previous slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="slider-dots">
          ${dotsHtml}
        </div>
        <button class="slider-btn btn-next" aria-label="Next slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;

    setupSliderLogic(container);
  }

  function setupSliderLogic(root) {
    const track = root.querySelector('.slider-track');
    const prev  = root.querySelector('.btn-prev');
    const next  = root.querySelector('.btn-next');
    const dots  = root.querySelectorAll('.slider-dot');
    const viewport = root.querySelector('.slider-viewport');
    if (!track || !prev || !next) return;

    let index = 0;
    const total = REVIEWS.length;
    let autoplayTimer = null;

    function getCardWidth() {
      if (viewport && viewport.clientWidth > 0) return viewport.clientWidth;
      const firstCard = track.firstElementChild;
      return firstCard ? firstCard.offsetWidth : root.offsetWidth;
    }

    function updateSlider(immediate = false) {
      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return;
      if (immediate) track.style.transition = 'none';
      track.style.transform = `translateX(-${index * cardWidth}px)`;
      if (immediate) {
        track.offsetHeight; 
        track.style.transition = '';
      }
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }

    function slideNext() {
      if (!root.isConnected) {
        stopAutoplay();
        return;
      }
      index = (index + 1) % total;
      updateSlider();
    }

    function slidePrev() {
      index = (index - 1 + total) % total;
      updateSlider();
    }

    const onPrevClick = () => { slidePrev(); restartAutoplay(); };
    const onNextClick = () => { slideNext(); restartAutoplay(); };
    
    prev.addEventListener('click', onPrevClick);
    next.addEventListener('click', onNextClick);

    const onDotClick = e => {
      index = parseInt(e.target.getAttribute('data-index'));
      updateSlider();
      restartAutoplay();
    };

    dots.forEach(dot => dot.addEventListener('click', onDotClick));

    let startX = 0, currentX = 0, isSwiping = false;
    const onTouchStart = e => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      stopAutoplay();
    };
    const onTouchMove = e => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) slideNext();
        else slidePrev();
      }
      restartAutoplay();
    };

    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd);

    const onResize = () => updateSlider(true);
    window.addEventListener('resize', onResize);

    function startAutoplay() { 
      stopAutoplay();
      autoplayTimer = setInterval(slideNext, 7000); 
    }
    function stopAutoplay() { 
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    
    startAutoplay();

    root._sliderCleanup = () => {
      stopAutoplay();
      prev.removeEventListener('click', onPrevClick);
      next.removeEventListener('click', onNextClick);
      dots.forEach(dot => dot.removeEventListener('click', onDotClick));
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('mouseenter', stopAutoplay);
      track.removeEventListener('mouseleave', startAutoplay);
      window.removeEventListener('resize', onResize);
    };
  }

  fetch('https://randomuser.me/api/?results=6&inc=name,picture&nat=us,gb,ca,au')
    .then(res => res.json())
    .then(data => {
      const people = data.results.map(p => ({
        name: `${p.name.first} ${p.name.last}`,
        pic: p.picture.large
      }));
      renderSlider(people);
    })
    .catch(() => {
      renderSlider(FALLBACK_PEOPLE);
    });
};

window.initReferencesSlider();
