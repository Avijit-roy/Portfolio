/* js/model3d.js — Three.js scene, GLTF model, lights, animation
   PERF: frame-capped to 40fps, paused when off-screen or tab hidden */
(function initBlob() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('blob-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,          // off — biggest GPU saving
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap DPR
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  let loadedModel = null;
  const pivotGroup = new THREE.Group();
  scene.add(pivotGroup);

  const loader = new THREE.GLTFLoader();
  loader.load('pixellabs-potion-3620.glb', gltf => {
    loadedModel = gltf.scene;

    const box    = new THREE.Box3().setFromObject(loadedModel);
    const size   = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = (isFinite(maxDim) && maxDim > 0.0001) ? 3.5 / maxDim : 1.5;
    loadedModel.scale.set(scale, scale, scale);
    loadedModel.position.set(
      isFinite(center.x) ? -center.x * scale : 0,
      isFinite(center.y) ? -center.y * scale : 0,
      isFinite(center.z) ? -center.z * scale : 0
    );
    pivotGroup.add(loadedModel);
  }, undefined, err => console.error('GLTF load error:', err));

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const light1 = new THREE.PointLight(0x9933ff, 2, 10);
  light1.position.set(2, 2, 2); scene.add(light1);
  const light2 = new THREE.PointLight(0x4400cc, 2, 10);
  light2.position.set(-2, -1, -2); scene.add(light2);

  // Input tracking
  const mouse     = new THREE.Vector2(0.5, 0.5);
  const targetRot = new THREE.Vector2(0, 0);
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let isDragging = false, prevX = 0, prevY = 0;
  let dragRotX = 0, dragRotY = 0, targetDragRotX = 0, targetDragRotY = 0;
  const IGNORE = 'a, button, input, textarea, .project-card, .stat-card, .skill-item, .contact-form, .navbar, .gh-profile-card';

  window.addEventListener('mousedown', e => {
    if (e.target.closest(IGNORE)) return;
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    targetDragRotY += (e.clientX - prevX) * 0.005;
    targetDragRotX += (e.clientY - prevY) * 0.005;
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('touchstart', e => {
    if (e.target.closest(IGNORE)) return;
    if (e.touches.length > 0) { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length === 0) return;
    targetDragRotY += (e.touches[0].clientX - prevX) * 0.005;
    targetDragRotX += (e.touches[0].clientY - prevY) * 0.005;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Visibility gate — stop render when hero is scrolled away
  const heroSection = document.getElementById('hero');
  let blobVisible = true;
  new IntersectionObserver(entries => {
    blobVisible = entries[0].isIntersecting;
    canvas.style.opacity = blobVisible ? '1' : '0';
  }, { threshold: 0.05 }).observe(heroSection);

  // Tab-hidden gate — stop render when tab is inactive
  let tabVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });

  // Frame-rate cap: target 40fps instead of native 60fps
  const FRAME_MS = 1000 / 40;
  let lastTime = 0;
  let clock = 0;
  let rafId = null;

  function animate(now) {
    rafId = requestAnimationFrame(animate);

    // Skip frame if tab is hidden or model is off-screen
    if (!tabVisible || !blobVisible) return;

    // Throttle to FRAME_MS
    if (now - lastTime < FRAME_MS) return;
    lastTime = now;

    clock += 0.012;

    dragRotX += (targetDragRotX - dragRotX) * 0.08;
    dragRotY += (targetDragRotY - dragRotY) * 0.08;
    targetRot.x += (mouse.y * 0.4 - targetRot.x) * 0.04;
    targetRot.y += (mouse.x * 0.5 - targetRot.y) * 0.04;

    if (loadedModel) {
      pivotGroup.rotation.x = targetRot.x + dragRotX + Math.sin(clock * 0.3) * 0.08;
      pivotGroup.rotation.y = targetRot.y + dragRotY + clock * 0.18;
      pivotGroup.position.y = -0.2 + Math.sin(clock * 0.8) * 0.1;
    }

    light1.position.x = Math.sin(clock * 0.6) * 3;
    light1.position.z = Math.cos(clock * 0.6) * 3;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
  canvas.style.transition = 'opacity 0.6s ease';
})();
