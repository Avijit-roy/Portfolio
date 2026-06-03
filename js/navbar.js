/* js/navbar.js — Scroll behaviour, hamburger toggle, smooth anchors, and Hero popup */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  // Hero Popup Elements
  const heroPopup     = document.getElementById('hero-popup');
  const heroClose     = document.getElementById('hero-close');
  
  // Navigation elements
  const navProfile        = document.getElementById('nav-profile');
  const navProjects       = document.getElementById('nav-projects');
  const navAbout          = document.getElementById('nav-about');
  const navContributions  = document.getElementById('nav-contributions');
  const navRecommendations = document.getElementById('nav-recommendations');
  const navContact        = document.getElementById('nav-contact');

  // Helper to trigger beacon popup or fallback to section scroll
  const handleBeaconNav = (e, beaconId, fallbackTarget) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Play sci-fi click SFX
    if (window.playClickSound) window.playClickSound();

    if (window.beaconManager && window.beaconManager.beacons) {
      const beacon = window.beaconManager.beacons.find(b => b.data.id === beaconId);
      if (beacon) {
        window.beaconManager.showPopup(beacon.data);
        if (navLinks) navLinks.classList.remove('open');
        return true;
      }
    }

    if (fallbackTarget) {
      const target = document.querySelector(fallbackTarget);
      if (target) {
        const navH = navbar ? navbar.offsetHeight : 0;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
        if (navLinks) navLinks.classList.remove('open');
      }
    }
    return false;
  };

  if (navProfile) {
    navProfile.addEventListener('click', (e) => {
      if (!handleBeaconNav(e, '01', null)) {
        if (heroPopup) {
          heroPopup.classList.add('active');
          if (navLinks) navLinks.classList.remove('open');
        }
      }
    });
  }

  if (navProjects) {
    navProjects.addEventListener('click', (e) => {
      handleBeaconNav(e, '02', '#work');
    });
  }

  if (navAbout) {
    navAbout.addEventListener('click', (e) => {
      handleBeaconNav(e, '03', '#about');
    });
  }

  if (navContributions) {
    navContributions.addEventListener('click', (e) => {
      handleBeaconNav(e, '04', '#github');
    });
  }

  if (navRecommendations) {
    navRecommendations.addEventListener('click', (e) => {
      handleBeaconNav(e, '05', '#references');
    });
  }

  if (navContact) {
    navContact.addEventListener('click', (e) => {
      handleBeaconNav(e, '06', '#contact');
    });
  }

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Hamburger Menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const open  = navLinks.classList.contains('open');
      if (spans.length >= 3) {
        spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
        spans[1].style.opacity   = open ? '0' : '';
        spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        // Play sound for all links including Resume
        if (window.playClickSound) window.playClickSound();

        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity   = '';
        });
      });
    });
  }

  if (heroClose && heroPopup) {
    heroClose.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      heroPopup.classList.remove('active');
    });
  }

  // Close popup when clicking outside the card
  window.addEventListener('click', (e) => {
    if (heroPopup && heroPopup.classList.contains('active') && !e.target.closest('.hero-card')) {
      heroPopup.classList.remove('active');
    }
  });

  // Smooth anchor scrolling with nav offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
