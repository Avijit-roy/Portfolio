# Avijit Roy — Creative Developer Portfolio

An immersive, premium, high-fidelity portfolio website built with pure HTML, Vanilla CSS, and JavaScript. Featuring a real-time interactive Three.js 3D canvas, dynamic starfield particle systems, and advanced REST API integrations.

### 🌐 Live Demo
👉 **[View Live Portfolio](https://portfolio-xi-teal-37.vercel.app/)**

---

## 🎨 Design & Architecture
* **Asymmetric Visuals**: Features a floating glassmorphic container card aligned to the left, leaving the right side open as a dedicated stage for live 3D web rendering.
* **100% Modular Structure**: Completely decoupled legacy monolithic stylesheets and scripts into single-responsibility, highly maintainable component modules without the overhead of build tools or package managers.

---

## 🚀 Key Features

### 1. **Interactive 3D Stage (Three.js)**
* Renders a premium, metallic, heart-shaped potion bottle model (`.glb`).
* Features an auto-calculating `Box3` bounding volume to center the model perfectly on its pivot point, allowing visual rotation around its absolute middle.
* Fully interactive lighting system featuring point light sweeps, ambient illumination, and directional highlighting.
* Reacts dynamically to mouse coordinates (hover movement) and drag gestures (with full momentum physics).

### 2. **Ambient Music Engine**
* Plays background space music (`leberch-space-440026.mp3`) with an active equalizer toggle button.
* Bouncing equalizer visualizer animations sync perfectly with play/pause states.
* **Autoplay-on-Load**: Automatically resumes audio playing across page reloads.
* **Autoplay Resiliency**: Gracefully detects browser policy blocks and registers a silent, one-time document click/touch event listener to play sound instantly on the user's first natural page interaction.
* **State Persistence**: Remembers your audio configuration (playing vs. paused) across sessions using `localStorage`.

### 3. **Dynamic Client Recommendations**
* A high-fidelity, sliding horizontal testimonial card track showing professional reviews.
* Integrates with the **RandomUser REST API** to dynamically fetch candidate avatars and details on every fresh page load.
* Features a robust local fallback mechanism using premium Unsplash visuals if rate limits are hit or connection is offline.
* Supports responsive, physics-based touch/swipe actions on mobile.

### 4. **Live GitHub Integrations**
* Uses the **GitHub REST API** to dynamically fetch repository stars, counts, and descriptions.
* Displays a live, stylized contribution graph (`ghchart.rshah.org`) showing continuous contribution details.

### 5. **Creative Parallax Starfield**
* Generates thousands of stars dynamically on a hardware-accelerated `<canvas>`.
* Includes parallax depth physics, interactive drag acceleration, and shooting stars across the viewport.

---

## 📁 Project Structure

```
MyPortfolio/
├── index.html               # Semantic HTML structure & viewport config
├── Aj.pdf                   # Resume document
├── ChatGPTImage.png         # Hero avatar picture
├── icons8-star-100.png      # Custom star favicon
├── leberch-space-440026.mp3  # Ambient background soundtrack
├── pixellabs-potion-3620.glb  # High-fidelity 3D Potion bottle asset
│
├── css/                     # Modulalized Stylesheets
│   ├── base.css             # Design tokens, reset, typography, and base animations
│   ├── cursor.css           # Custom cursor dot and trailing delayed ring
│   ├── navbar.css           # Header navigation, hamburger toggle, and EQ visualizer
│   ├── hero.css             # Floating left-aligned glassmorphic container
│   ├── work.css             # Dynamic project grid cards and skeleton loaders
│   ├── about.css            # Developer info, skill chips, and Github metrics
│   ├── github.css           # Contribution graph section panel
│   ├── references.css       # Client Feedback testimonial slider
│   ├── contact.css          # Styled contact form inputs and buttons
│   ├── footer.css           # Footer info
│   └── responsive.css       # Complete viewport media queries
│
└── js/                      # Modularized ES6 Components
    ├── cursor.js            # Custom interactive mouse trailing cursor
    ├── stars.js             # Canvas starfield parallax & shooting stars
    ├── model3d.js           # Three.js 3D GLTF renderer, lights & interaction
    ├── navbar.js            # Sticky header, mobile drawer menu & anchor navigation
    ├── projects.js          # Live GitHub repository REST API fetcher
    ├── references.js        # Testimonials carousel with RandomUser API integration
    ├── contact.js           # Interactive form submission simulator
    └── audio.js             # Persisted sound engine & autoplay controller
```

---

## ⚡ Quick Start

### ⚠️ Important: CORS Policy Restriction
Modern browsers strictly prevent loading external binary files (like the `.glb` 3D model) directly from the local file system (`file://` protocol) due to Cross-Origin Resource Sharing (CORS) security restrictions.

**To run the website locally and view the 3D model, you must use a local HTTP server:**

1. Navigate to your project directory:
   ```bash
   cd "webdeveloping/MyPortfolio"
   ```
2. Start a simple web server:
   * **Python 3**:
     ```bash
     python3 -m http.server 8000 --bind 127.0.0.1
     ```
   * **NodeJS**:
     ```bash
     npx http-server -p 8000
     ```
3. Open your browser and view the portfolio live:
   👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 🛠️ Built With
* [Three.js](https://threejs.org/) — Immersive WebGL 3D render engine.
* [Space Grotesk & Inter](https://fonts.google.com/) — Elegant typography from Google Fonts.
* [RandomUser API](https://randomuser.me/) — Realistic, dynamic client avatars.
* [GitHub REST API](https://docs.github.com/en/rest) — Star metrics and user information.

---

## 📝 License
This project is open source and available for educational and personal use.

---

**Made with ❤️ by Avijit Roy**
