# Avijit Roy — Creative Developer Portfolio

An immersive, premium, high-fidelity portfolio website built with pure HTML, Vanilla CSS, and JavaScript. Featuring a real-time interactive Three.js 3D canvas, dynamic beacon navigation system, and advanced REST API integrations.

### 🌐 Live Demo
👉 **[View Live Portfolio](https://portfolio-xi-teal-37.vercel.app/)**

---

## 🎨 Design & Architecture
* **Asymmetric Visuals**: Features a floating glassmorphic container card aligned to the left, leaving the right side open as a dedicated stage for live 3D web rendering.
* **Interactive 3D Universe**: A fully realized space environment featuring an animated spaceship, solar embers, and shimmering energy trails.
* **100% Modular Structure**: Completely decoupled stylesheets and scripts into single-responsibility, highly maintainable component modules.

---

## 🚀 Key Features

### 1. **Interactive 3D Stage (Three.js)**
* Renders a high-fidelity space traveler model (`scene.glb`).
* **Post-Processing**: Uses `UnrealBloomPass` for a cinematic sci-fi glow.
* **Particle Systems**: Custom-built systems for twinkling sparkles, solar vortex embers, and energy trails.
* **Dynamic Interaction**: Camera reacts to orbit controls with smooth damping and momentum physics.

### 2. **3D Beacon Navigation System**
* **In-World Interaction**: Interactive 3D beacons floating in space that act as navigation portals.
* **Content Injection**: Clicking a beacon dynamically clones and injects HTML sections into a futuristic glassmorphic popup.
* **Smart Content Mapping**: Automatically detects and renders specialized content like GitHub graphs, testimonial sliders, or contact forms within the 3D portal.

### 3. **Ambient Music & SFX Engine**
* **Background Soundtrack**: Immersive space ambient audio with a persistent equalizer toggle.
* **Sci-Fi Click Effects**: Tactical audio feedback (`.wav`) on all interactive UI elements and 3D beacons.
* **State Persistence**: Remembers user audio preferences across sessions using `localStorage`.
* **Autoplay Resiliency**: Gracefully handles browser autoplay restrictions with intelligent event listeners.

### 4. **Modern UI/UX**
* **Desktop Tooltips**: Clean header navigation that hides text labels on desktop to prioritize visuals, showing them as elegant tooltips on hover.
* **Mobile Optimized**: Fully responsive drawer menu with an offset header to prevent overlap on small screens.
* **Dynamic Recommendations**: Fetches professional reviews and integrates with the **RandomUser REST API** for realistic, dynamic candidate avatars.

### 5. **Live GitHub Integrations**
* **Repository Metrics**: Uses the **GitHub REST API** to dynamically fetch stars, counts, and project descriptions.
* **Contribution Graph**: Displays a live, stylized contribution chart showing coding activity.

---

## 📁 Project Structure

```
MyPortfolio/
├── index.html               # Semantic HTML structure & viewport config
├── assets/
│   ├── audio/               # Ambient soundtrack and SFX
│   ├── images/              # Avatars, icons, and favicons
│   └── models/              # High-fidelity 3D GLB assets
│
├── css/                     # Modularized Stylesheets
│   ├── base.css             # Reset, typography, and base animations
│   ├── beacons.css          # 3D portal popups and beacon headers
│   ├── navbar.css           # Navigation, logo, and desktop tooltips
│   ├── responsive.css       # Viewport-specific media queries
│   └── (and more...)        # Section-specific styles (hero, work, about, etc.)
│
└── js/                      # Modularized ES6 Components
    ├── scene.js             # Three.js main scene, lighting, and animation loop
    ├── beacons.js           # 3D interaction logic and popup management
    ├── stars.js             # Canvas starfield parallax & shooting stars
    ├── audio.js             # Sound engine and SFX controller
    ├── navbar.js            # Scroll logic and mobile menu behavior
    └── (and more...)        # Functional logic (projects, references, etc.)
```

---

## ⚡ Quick Start

### ⚠️ Important: CORS Policy Restriction
Modern browsers strictly prevent loading external binary files (like the `.glb` 3D model) directly from the local file system (`file://` protocol).

**To run the website locally, you must use a local HTTP server:**

1. Navigate to your project directory:
   ```bash
   cd "MyPortfolio"
   ```
2. Start a simple web server:
   * **Python 3**: `python3 -m http.server 8000`
   * **NodeJS**: `npx http-server -p 8000`
3. Open your browser and view the portfolio live:
   👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 🛠️ Built With
* [Three.js](https://threejs.org/) — Immersive WebGL 3D render engine.
* [Space Grotesk & Inter](https://fonts.google.com/) — Futuristic typography.
* [GitHub REST API](https://docs.github.com/en/rest) — Dynamic project data.
* [RandomUser API](https://randomuser.me/) — Realistic recommendation avatars.

---

## 📝 License
This project is open source and available for educational and personal use.

---

**Crafted with 💜 by Avijit Roy**
