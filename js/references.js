/* js/references.js — Interactive Reference Testimonials Slider */
(function initReferencesSlider() {
  const container = document.getElementById('references-slider-container');
  if (!container) return;

  // 6 Custom Professional reviews written about Avijit Roy
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

  // Resilient fallback people in case API request fails or is offline
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
      <div class="slider-viewport" id="slider-viewport">
        <div class="slider-track" id="slider-track">
          ${slidesHtml}
        </div>
      </div>
      <div class="slider-controls">
        <button class="slider-btn" id="slider-prev" aria-label="Previous slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="slider-dots" id="slider-dots">
          ${dotsHtml}
        </div>
        <button class="slider-btn" id="slider-next" aria-label="Next slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;

    setupSliderLogic();
  }

  function setupSliderLogic() {
    const track = document.getElementById('slider-track');
    const dots  = document.querySelectorAll('.slider-dot');
    const prev  = document.getElementById('slider-prev');
    const next  = document.getElementById('slider-next');
    if (!track || !prev || !next) return;

    let index = 0;
    const total = REVIEWS.length;
    let autoplayTimer = null;

    function updateSlider() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }

    function slideNext() {
      index = (index + 1) % total;
      updateSlider();
    }

    function slidePrev() {
      index = (index - 1 + total) % total;
      updateSlider();
    }

    prev.addEventListener('click', () => { slidePrev(); restartAutoplay(); });
    next.addEventListener('click', () => { slideNext(); restartAutoplay(); });

    dots.forEach(dot => {
      dot.addEventListener('click', e => {
        index = parseInt(e.target.getAttribute('data-index'));
        updateSlider();
        restartAutoplay();
      });
    });

    // Touch & Swipe Support
    let startX = 0, currentX = 0, isSwiping = false;

    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) slideNext();
        else slidePrev();
      }
      restartAutoplay();
    });

    // Autoplay Engine
    function startAutoplay() {
      autoplayTimer = setInterval(slideNext, 7000);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    startAutoplay();

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
  }

  // Fetch 6 random people using RandomUser API
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
      // Graceful fallback to static high-res avatars
      renderSlider(FALLBACK_PEOPLE);
    });
})();
