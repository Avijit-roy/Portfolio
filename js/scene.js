import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BeaconManager } from './beacons.js';


// ─── Mobile Detection & Performance Tuning ───────────────────────────────
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 768);

// ─── Renderer ────────────────────────────────────────────────────────────────
const canvas = document.getElementById('glb-canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ─── Scene ───────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000008);

// ─── Camera ──────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000000
);

// Angled Third Person View
camera.position.set(-150, 100, 300); 
camera.lookAt(0, 0, -1000);

// ─── Lighting ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const frontLight = new THREE.DirectionalLight(0xffffff, 2.5);
frontLight.position.set(500, 1000, 2500);
scene.add(frontLight);

const holeGlow = new THREE.PointLight(0x3300ff, 8, 6000);
holeGlow.position.set(0, 0, -600);
scene.add(holeGlow);

// ─── Orbit Controls ──────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
controls.enableZoom = true;
controls.enablePan = true;
controls.rotateSpeed = 0.35;
controls.zoomSpeed = 1.0; // Reduced scroll sensitivity

controls.minDistance = 10;
controls.maxDistance = 1000;

controls.target.set(0, 0, -500);

// ─── Post Processing ────────────────────────────────────────────────────────
let composer = null;
if (!isMobile) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, // Strength (Reduced from 1.5)
    0.2, // Radius (Reduced from 0.4)
    0.9  // Threshold (Increased from 0.85)
  );

  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
}

// ─── Global State ────────────────────────────────────────────────────────────
let mixer = null;
let beaconManager = null;
const energyTrails = [];
const vortexParts = [];
const propulrorParts = [];
const lasers = []; // Active laser bolts
const laserParticles = []; // Cyan sparks
let sparkles = null;
let vortexEmbers = null;
let propulrorSparkles = null;

let nave2Object = null;
let vortex1Object = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function createBlueSparks(pos, dir) {
  const count = 16;
  const sparkGeo = new THREE.SphereGeometry(0.2, 4, 4);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });

  for (let i = 0; i < count; i++) {
    const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
    spark.position.copy(pos);
    
    // Spread velocity
    const velocity = dir.clone()
      .add(new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0
      ))
      .normalize()
      .multiplyScalar(Math.random() * 4 + 2);

    laserParticles.push({
      mesh: spark,
      velocity: velocity,
      life: 1.0,
      decay: 0.03 + Math.random() * 0.05
    });
    scene.add(spark);
  }
}

function fireLaser() {
  if (!nave2Object || !vortex1Object) return;

  // Sound feedback
  if (window.playLaserSound) window.playLaserSound();

  // Material for Raw Blue Neon Energy - Solid & Sharp
  const beamMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff
  });

  const startPos = new THREE.Vector3();
  nave2Object.getWorldPosition(startPos);
  
  const targetPos = new THREE.Vector3();
  vortex1Object.getWorldPosition(targetPos);
  
  const direction = targetPos.clone().sub(startPos).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3().crossVectors(direction, up).normalize().multiplyScalar(5);

  const createBolt = (offset) => {
    const boltGroup = new THREE.Group();
    
    // Single thicker cylinder for a sharp "raw energy" beam look
    const beamGeo = new THREE.CylinderGeometry(0.5, 1, 40, 8);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    
    boltGroup.add(beam);

    const pos = startPos.clone().add(offset);
    boltGroup.position.copy(pos);
    boltGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    scene.add(boltGroup);
    lasers.push({
      mesh: boltGroup,
      target: targetPos,
      direction: direction,
      speed: 35, // Faster for more "energy" impact
      distanceTraveled: 0,
      maxDistance: pos.distanceTo(targetPos) + 50
    });

    createBlueSparks(pos, direction);
  };

  createBolt(side.clone().multiplyScalar(-1));
  createBolt(side);
}

function handlePointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  if (nave2Object) {
    // Check intersection with Nave_2 and all its children
    const intersects = raycaster.intersectObject(nave2Object, true);
    if (intersects.length > 0) {
      fireLaser();
    }
  }
}

renderer.domElement.addEventListener('pointerdown', handlePointerDown);

function hideOverlay() {
  const overlay = document.getElementById('scene-loading');
  if (!overlay) return;
  overlay.style.transition = 'opacity 0.8s ease';
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.style.display = 'none'; }, 900);
}

function hasAncestor(object, namePart) {
  let p = object.parent;
  while (p) {
    if (p.name.includes(namePart)) return true;
    p = p.parent;
  }
  return false;
}

// ─── Sparkles System ─────────────────────────────────────────────────────────
function createSparkles(model) {
  const count = isMobile ? 500 : 1500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size.x * 1.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * size.y * 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * size.z * 2.0;
    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  sparkles = new THREE.Points(geometry, material);
  scene.add(sparkles);
}

// ─── Edge-Focused Vortex Embers ───────────────────
function createVortexEmbers(vortex) {
  const count = isMobile ? 1000 : 3500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const box = new THREE.Box3().setFromObject(vortex);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3().setFromMatrixPosition(vortex.matrixWorld);

  for (let i = 0; i < count; i++) {
    const radius = (0.8 + Math.random() * 0.4) * size.x; 
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = center.x + radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = center.y + radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = center.z + radius * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffaa00, 
    size: 2.8,      
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  vortexEmbers = new THREE.Points(geometry, material);
  scene.add(vortexEmbers);
}

// ─── Propulror_3 Purplish Sparkles ──────────────────────────────────────────
function createPropulrorSparkles(propulror) {
  const count = isMobile ? 300 : 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const box = new THREE.Box3().setFromObject(propulror);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3().setFromMatrixPosition(propulror.matrixWorld);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = center.x + (Math.random() - 0.5) * size.x * 1.2;
    positions[i * 3 + 1] = center.y + (Math.random() - 0.5) * size.y * 1.2;
    positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * size.z * 1.2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xcc88ff, // Light Purplish
    size: 1.5,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  propulrorSparkles = new THREE.Points(geometry, material);
  scene.add(propulrorSparkles);
}

// ─── GLB Loader ──────────────────────────────────────────────────────────────
const loader = new GLTFLoader();

loader.load(
  'assets/models/scene.glb',
  (gltf) => {
    const model = gltf.scene;

    let nave2 = null;
    let vortex1 = null;
    let prop3 = null;

    model.traverse((child) => {
      if (child.name.includes('Nave_2')) nave2 = child;
      if (child.name.includes('Vortex_1')) vortex1 = child;
      if (child.name.includes('Propulror_3')) prop3 = child;
    });

    nave2Object = nave2;
    vortex1Object = vortex1;

    model.traverse((child) => {
      // 1. Vortex_1: Highest Priority
      if (vortex1 && (child === vortex1 || hasAncestor(child, 'Vortex_1'))) {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.color.set(0xffaa00);
            mat.emissive.set(0xff4400);
            mat.emissiveIntensity = 4.5;
            mat.transparent = true;
            mat.opacity = 0.9;
            mat.blending = THREE.AdditiveBlending;
            mat.side = THREE.DoubleSide;
          });
          vortexParts.push(child);
        }
        return;
      }

      // 2. Propulror_3: Purplish Sparkly, Low Glow
      if (prop3 && (child === prop3 || hasAncestor(child, 'Propulror_3'))) {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.color.set(0x440088);      // Purplish base
            mat.emissive.set(0x9900ff);   // Purple glow
            mat.emissiveIntensity = 0.8;  // Low glow intensity
            mat.transparent = true;
            mat.opacity = 0.7;
          });
          propulrorParts.push(child);
        }
        return;
      }

      // 3. Nave_2 (The Ship): WHITE, ROUGH, DULL
      if (nave2 && (child === nave2 || hasAncestor(child, 'Nave_2'))) {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.color.set(0xffffff);
            mat.roughness = 1.0;
            mat.metalness = 0.0;
            if (mat.emissive) mat.emissive.set(0x000000);
          });
        }
        return;
      }

      // 4. Energy Trails (Orange)
      if (child.name.includes('Dizzy_Space_0') || hasAncestor(child, 'Dizzy_Space_0')) {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.color.set(0xffaa00);
            mat.emissive.set(0xff4400);
            mat.emissiveIntensity = 5.0;
            mat.transparent = true;
            mat.opacity = 0.8;
            mat.blending = THREE.AdditiveBlending;
            mat.side = THREE.DoubleSide;
          });
          energyTrails.push(child);
        }
      }
    });

    const targetModel = nave2 || model;
    const shipBox = new THREE.Box3().setFromObject(targetModel);
    const shipCenter = new THREE.Vector3();
    shipBox.getCenter(shipCenter);

    model.position.set(-shipCenter.x, -shipCenter.y, -shipCenter.z);

    if (vortex1) {
      vortex1.position.z -= 150;
    }

    scene.add(model);
    createSparkles(model);
    
    model.updateMatrixWorld(true);
    if (vortex1) createVortexEmbers(vortex1);
    if (prop3) createPropulrorSparkles(prop3);

    camera.position.set(-150, 100, 300); 
    controls.target.set(0, 0, -500);
    controls.update();

    // Initialize Beacons
    beaconManager = new BeaconManager(scene, camera, renderer);
    window.beaconManager = beaconManager;

    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.timeScale = 0.75;
        action.play();
      });
    }

    hideOverlay();
  },
  (xhr) => {
    if (xhr.total > 0) {
      const pct = Math.round((xhr.loaded / xhr.total) * 100);
      const bar = document.getElementById('scene-progress');
      if (bar) bar.style.width = pct + '%';
    }
  },
  (error) => {
    console.error('[scene] GLB Load Error:', error);
    hideOverlay();
  }
);

// ─── Animation Loop ──────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (mixer) mixer.update(delta);
  if (beaconManager) beaconManager.update(elapsed);

  // Update Lasers
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    const moveStep = l.direction.clone().multiplyScalar(l.speed);
    l.mesh.position.add(moveStep);
    l.distanceTraveled += l.speed;

    if (l.distanceTraveled >= l.maxDistance) {
      scene.remove(l.mesh);
      l.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      lasers.splice(i, 1);
    }
  }

  // Update Laser Particles (Cyan Sparks)
  for (let i = laserParticles.length - 1; i >= 0; i--) {
    const p = laserParticles[i];
    p.mesh.position.add(p.velocity);
    p.life -= p.decay;
    p.mesh.material.opacity = p.life;
    p.mesh.scale.setScalar(p.life);
    
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      laserParticles.splice(i, 1);
    }
  }

  // Smooth Energy Shimmer (Orange)
  vortexParts.forEach(part => {
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    materials.forEach(mat => {
      mat.emissiveIntensity = 4.5 + Math.sin(elapsed * 2.0) * 0.5;
    });
    part.scale.set(1, 1, 1);
  });

  // Solar Embers
  if (vortexEmbers) {
    vortexEmbers.rotation.y += 0.008;
    vortexEmbers.rotation.z += 0.004;
    vortexEmbers.material.opacity = 0.7 + Math.sin(elapsed * 3) * 0.2;
  }

  // Propulror Sparkles - Twinkling
  if (propulrorSparkles) {
    propulrorSparkles.material.opacity = 0.4 + Math.sin(elapsed * 10) * 0.4;
    propulrorSparkles.rotation.x += 0.002;
  }

  // Shimmering Energy Trails (Orange)
  energyTrails.forEach((trail, i) => {
    const materials = Array.isArray(trail.material) ? trail.material : [trail.material];
    materials.forEach(mat => {
      mat.emissiveIntensity = 4.0 + Math.sin(elapsed * 12 + i) * 3.0;
      const s = 1.0 + Math.sin(elapsed * 8 + i) * 0.08;
      trail.scale.set(s, s, s);
    });
  });

  // Twinkling White Sparkles
  if (sparkles) {
    sparkles.material.opacity = 0.5 + Math.sin(elapsed * 15) * 0.4;
    sparkles.rotation.z += 0.001;
    sparkles.rotation.y += 0.0005;
  }
  controls.update();
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

animate();

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const width = window.innerWidth, height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (composer) composer.setSize(width, height);
});
