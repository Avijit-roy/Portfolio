import * as THREE from 'three';

const BEACON_DATA = [
  {
    id: '01',
    title: 'Avijit Roy',
    tag: '01.Profile',
    image: 'assets/images/ChatGPTImage.webp', 
    sectionSelector: '#hero-popup .hero-card',
    content: 'Creative Developer & Passionate Learner. I specialize in building full-stack applications, IoT systems, and immersive web experiences.',
    meta: 'ORIGIN: INDIA // SECTOR: FULL-STACK // STATUS: ACTIVE',
    pos: { x: 80, y: 50, z: -150 }
  },
  {
    id: '02',
    title: 'Selected Work',
    tag: '02.Projects',
    sectionSelector: '#work',
    content: 'A collection of my most significant engineering achievements.',
    meta: 'SECTOR: ENGINEERING // ARCHIVE: ACCESSIBLE',
    pos: { x: -90, y: 80, z: -280 }
  },
  {
    id: '03',
    title: 'About Me',
    tag: '03.Biography',
    sectionSelector: '#about',
    content: 'Self-driven developer with a thirst for knowledge.',
    meta: 'ROLE: BUILDER // CORE: LEARNING',
    pos: { x: 120, y: -40, z: -420 }
  },
  {
    id: '04',
    title: 'Open Source',
    tag: '04.Contributions',
    sectionSelector: '#github',
    content: 'Highlighting contributions to the global developer community.',
    meta: 'SOURCE: GITHUB // USER: @Avijit-roy',
    pos: { x: -140, y: -100, z: -580 }
  },
  {
    id: '05',
    title: 'Recommendations',
    tag: '05.Feedback',
    sectionSelector: '#references',
    content: 'Verified endorsements from professional collaborators.',
    meta: 'STATUS: VALIDATED // TRUST-INDEX: HIGH',
    pos: { x: 60, y: 150, z: -750 }
  },
  {
    id: '06',
    title: 'Get In Touch',
    tag: '06.Contact',
    sectionSelector: '#contact',
    content: 'Communication channel open for collaboration and inquiries.',
    meta: 'PROTOCOL: SECURE // AVAILABILITY: READY',
    pos: { x: 0, y: 0, z: -900 }
  }
];

export class BeaconManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.beacons = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.popup = document.getElementById('beacon-popup');
    this.card = this.popup.querySelector('.beacon-card');
    this.header = this.popup.querySelector('.beacon-header');
    this.closeBtn = document.getElementById('beacon-close');
    this.sectionContainer = document.getElementById('beacon-section-container');
    this.defaultContent = document.getElementById('beacon-default-content');
    this.avatarEl = document.getElementById('beacon-avatar');
    this.titleEl = document.getElementById('beacon-title');
    this.tagEl = document.getElementById('beacon-tag');
    
    this.colors = {
      core: 0x00A8FF,
      inner: 0x00D4FF,
      outer: 0x0066FF,
      sparks: 0x7DF9FF
    };

    this.initPopup();
    this.createBeacons();
    this.addInteractivity();
  }

  initPopup() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        if (window.playClickSound) window.playClickSound();
        this.closePopup();
      });
    }
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.closePopup();
      }
    });
  }

  closePopup() {
    this.popup.classList.remove('active');
    setTimeout(() => {
      this.sectionContainer.innerHTML = '';
      this.card.classList.remove('expanded', 'hero-mode');
      if (this.header) this.header.style.display = '';
    }, 400);
  }

  createBeacons() {
    BEACON_DATA.forEach(data => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(data.pos.x, data.pos.y, data.pos.z);
      beaconGroup.userData = data;

      const coreGeo = new THREE.SphereGeometry(2.5, 32, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: this.colors.core,
        emissive: this.colors.core,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 1.0
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      beaconGroup.add(core);

      const innerRingGeo = new THREE.TorusGeometry(6, 0.2, 16, 100);
      const innerRingMat = new THREE.MeshStandardMaterial({
        color: this.colors.inner,
        emissive: this.colors.inner,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = Math.PI / 2;
      beaconGroup.add(innerRing);

      const outerRingGeo = new THREE.TorusGeometry(11, 0.1, 16, 100);
      const outerRingMat = new THREE.MeshStandardMaterial({
        color: this.colors.outer,
        emissive: this.colors.outer,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.6
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.x = Math.PI / 2;
      beaconGroup.add(outerRing);

      const sparks = this.createSparks();
      beaconGroup.add(sparks);

      const label = this.createLabel(data.tag);
      label.position.set(0, 30, 0);
      beaconGroup.add(label);

      this.beacons.push({
        group: beaconGroup,
        core: core,
        innerRing: innerRing,
        outerRing: outerRing,
        sparks: sparks,
        label: label,
        initialY: data.pos.y,
        data: data
      });
      this.group.add(beaconGroup);
    });
  }

  createSparks() {
    const count = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = r * Math.sin(theta);
      velocities.push({
        speed: 0.01 + Math.random() * 0.02,
        angle: theta,
        radius: r,
        yOffset: (Math.random() - 0.5) * 0.08
      });
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: this.colors.sparks,
      size: 1.0,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.userData.velocities = velocities;
    return points;
  }

  createLabel(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 32;
    ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    canvas.width = Math.max(128, textWidth + 80);
    canvas.height = 128;

    ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    const boxW = textWidth + 40;
    const boxH = fontSize + 20;
    const boxX = (canvas.width - boxW) / 2;
    const boxY = (canvas.height - boxH) / 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = 'rgba(0, 168, 255, 0.1)';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00D4FF';
    ctx.shadowBlur = 4;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(15 * aspect, 15, 1);
    return sprite;
  }

  addInteractivity() {
    const onPointerDown = (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.group.children, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.id) {
          obj = obj.parent;
        }
        if (obj.userData.id) {
          if (window.playClickSound) window.playClickSound();
          this.showPopup(obj.userData);
        }
      }
    };
    this.renderer.domElement.addEventListener('pointerdown', onPointerDown);
  }

  showPopup(data) {
    this.sectionContainer.innerHTML = '';
    this.titleEl.textContent = data.title;
    this.tagEl.textContent = data.tag;
    if (this.header) this.header.style.display = data.id === '01' ? 'none' : '';
    this.card.classList.toggle('hero-mode', data.id === '01');

    if (data.sectionSelector) {
      const originalSection = document.querySelector(data.sectionSelector);
      if (originalSection) {
        const clone = originalSection.cloneNode(true);
        clone.style.opacity = '1';
        clone.style.visibility = 'visible';
        clone.style.display = 'block';
        clone.style.position = 'relative';
        clone.style.transform = 'none';
        
        this.sectionContainer.appendChild(clone);
        if (data.id === '01') {
          this.card.classList.remove('expanded');
          this.defaultContent.style.display = 'none';
        } else {
          this.card.classList.add('expanded');
          this.defaultContent.style.display = 'none';
        }

        if (data.id === '02' && window.renderProjectPatterns) {
          window.renderProjectPatterns(clone);
        }
        if (data.id === '03') {
          const viewProjBtn = clone.querySelector('.projects-btn');
          if (viewProjBtn) {
            viewProjBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (window.playClickSound) window.playClickSound();
              const workBeacon = this.beacons.find(b => b.data.id === '02');
              if (workBeacon) this.showPopup(workBeacon.data);
            });
          }
        }
        if (data.id === '05' && window.initReferencesSlider) {
          const sliderContainer = clone.querySelector('.slider-container');
          if (sliderContainer) {
            // Clear the stale cloned HTML (has no event listeners) immediately
            sliderContainer.innerHTML = '<div class="ref-skeleton"></div>';
            // Small delay so the popup is fully painted before JS measures widths
            setTimeout(() => window.initReferencesSlider(sliderContainer), 80);
          }
        }
        if (data.id === '06' && window.initContactForm) {
          const form = clone.querySelector('form');
          if (form) window.initContactForm(form);
        }

        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      } else {
        this.showDefault(data);
      }
    } else {
      this.showDefault(data);
    }
    this.popup.classList.add('active');
  }

  showDefault(data) {
    this.defaultContent.style.display = 'block';
    this.card.classList.remove('expanded');
    if (data.image) {
      this.avatarEl.src = data.image;
      this.avatarEl.style.display = 'block';
    } else {
      this.avatarEl.style.display = 'none';
    }
    document.getElementById('beacon-content').textContent = data.content;
    document.getElementById('beacon-meta').textContent = data.meta;
  }

  update(elapsed) {
    this.beacons.forEach((b, i) => {
      b.group.position.y = b.initialY + Math.sin(elapsed * 1.2 + i) * 8;
      b.innerRing.rotation.z += 0.02;
      b.outerRing.rotation.z -= 0.01;
      b.innerRing.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.5) * 0.1;
      b.outerRing.rotation.x = Math.PI / 2 + Math.cos(elapsed * 0.5) * 0.1;
      const pulse = 3 + Math.sin(elapsed * 3 + i) * 0.5;
      b.core.material.emissiveIntensity = pulse;
      b.innerRing.material.emissiveIntensity = pulse * 0.7;
      b.outerRing.material.emissiveIntensity = pulse * 0.4;
      const posAttr = b.sparks.geometry.attributes.position;
      const vels = b.sparks.userData.velocities;
      for (let j = 0; j < vels.length; j++) {
        vels[j].angle += vels[j].speed;
        const r = vels[j].radius;
        posAttr.setX(j, r * Math.cos(vels[j].angle));
        posAttr.setY(j, posAttr.getY(j) + vels[j].yOffset);
        posAttr.setZ(j, r * Math.sin(vels[j].angle));
        if (Math.abs(posAttr.getY(j)) > 10) posAttr.setY(j, 0);
      }
      posAttr.needsUpdate = true;
      b.sparks.rotation.y += 0.005;
      b.label.position.y = 30 + Math.sin(elapsed * 2 + i) * 1.5;
    });
  }
}
