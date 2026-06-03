/* js/audio.js — Background ambient audio + visualizer toggle */
(function initBackgroundAudio() {
  const audio      = document.getElementById('bg-audio');
  const clickAudio = document.getElementById('click-audio');
  const toggleBtn  = document.getElementById('sound-toggle');

  if (!audio || !toggleBtn) {
    console.warn('[audio] Elements not found:', { audio, toggleBtn });
    return;
  }

  const AUDIO_SRC = 'assets/audio/leberch-space-440026.mp3';

  // Retrieve previous sound preference, default to playing
  let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

  // Global helper for click SFX
  window.playClickSound = function() {
    if (!clickAudio) return;
    clickAudio.currentTime = 0;
    clickAudio.play().catch(err => console.warn('[audio] Click sound failed:', err));
  };

  function setPlaying(playing) {
    toggleBtn.classList.toggle('playing', playing);
    toggleBtn.classList.toggle('paused',  !playing);
    localStorage.setItem('soundEnabled', playing ? 'true' : 'false');
  }

  function ensureSrc() {
    if (!audio.src || audio.src === '') {
      audio.src = AUDIO_SRC;
    }
  }

  function togglePlay() {
    ensureSrc();
    if (audio.paused) {
      audio.play()
        .then(() => {
          setPlaying(true);
        })
        .catch(err => console.error('[audio] Playback failed:', err));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  function cleanListeners() {
    document.removeEventListener('click',      autoPlayHandler);
    document.removeEventListener('touchstart', autoPlayHandler);
  }

  const autoPlayHandler = (e) => {
    if (e && e.target && e.target.closest('#sound-toggle')) return;

    if (soundEnabled) {
      ensureSrc();
      if (audio.paused) {
        audio.play()
          .then(() => {
            setPlaying(true);
            cleanListeners();
          })
          .catch(() => {
            // Autoplay prevented — wait for user interaction
          });
      }
    } else {
      cleanListeners();
    }
  };

  if (soundEnabled) {
    document.addEventListener('click',      autoPlayHandler);
    document.addEventListener('touchstart', autoPlayHandler);
  } else {
    setPlaying(false);
  }
})();
