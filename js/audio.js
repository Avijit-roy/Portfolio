/* js/audio.js — Background ambient audio + visualizer toggle */
(function initBackgroundAudio() {
  const audio     = document.getElementById('bg-audio');
  const toggleBtn = document.getElementById('sound-toggle');
  if (!audio || !toggleBtn) return;

  // Retrieve previous sound preference, default to playing
  let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

  function setPlaying(playing) {
    toggleBtn.classList.toggle('playing', playing);
    toggleBtn.classList.toggle('paused',  !playing);
    localStorage.setItem('soundEnabled', playing ? 'true' : 'false');
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play()
        .then(() => setPlaying(true))
        .catch(err => console.error('Playback failed:', err));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent bubbling up to document click listener
    togglePlay();
  });

  function cleanListeners() {
    document.removeEventListener('click',      autoPlayHandler);
    document.removeEventListener('touchstart', autoPlayHandler);
  }

  const autoPlayHandler = (e) => {
    // Ignore clicks directly on the toggle button to let its own listener handle it
    if (e && e.target && e.target.closest('#sound-toggle')) return;

    if (soundEnabled && audio.paused) {
      audio.play()
        .then(() => {
          setPlaying(true);
          cleanListeners();
        })
        .catch(() => {});
    } else {
      cleanListeners();
    }
  };

  // If user enabled sound, attempt to play immediately
  if (soundEnabled) {
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay blocked by browser security, register one-time document listeners
        document.addEventListener('click',      autoPlayHandler);
        document.addEventListener('touchstart', autoPlayHandler);
      });
  } else {
    setPlaying(false);
  }
})();
