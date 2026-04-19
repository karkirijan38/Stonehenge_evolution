# 🏛️ Stonehenge: 5 Phases of Evolution

An interactive 3D visualization of Stonehenge's 5,000-year archaeological history. Built with Three.js, featuring VR support, voice narration, and fullscreen mode.

## 🔗 Live Demo

[https://karkirijan38.github.io/Stonehenge_evolution/](https://karkirijan38.github.io/Stonehenge_evolution/)

## 📋 Overview

This project presents the construction and evolution of Stonehenge through five distinct archaeological phases, from 3000 BCE to the present day. Users can explore each phase in 3D, listen to narrated descriptions, and view the monument from any angle.

## 🏛️ The Five Phases

| Phase | Period | Description |
|-------|--------|-------------|
| **Phase 1** | 3000 BCE | Origins - Circular ditch and bank, wooden posts |
| **Phase 2** | 2500 BCE | First Stones - Bluestones arrive from Wales |
| **Phase 3** | 2200 BCE | Great Monument - Sarsen circle and trilithons |
| **Phase 4** | 1500 BCE | Modifications - Stone rearrangement, Avenue construction |
| **Phase 5** | Present Day | UNESCO World Heritage site, conservation, tourism |

## 🎮 Features

- **3D Interactive Viewer** - Drag to rotate, scroll to zoom
- **VR Headset Support** - Enter immersive VR mode (WebXR)
- **Voice Narration** - Audio descriptions for each phase with toggle button
- **Fullscreen Mode** - Immersive viewing experience
- **Phase Navigation** - Buttons to switch between archaeological periods
- **Realistic Graphics** - Dynamic lighting, shadows, stars, and atmospheric effects

## 🛠️ Technologies Used

- **Three.js** - 3D graphics library
- **WebXR** - VR headset support
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6)** - Interactive functionality
- **GitHub Pages** - Hosting

## 📁 Project Structure
```

Stonehenge_evolution/
├── index.html              # Landing page
├── phase1.html             # Phase 1: Origins
├── phase2.html             # Phase 2: First Stones
├── phase3.html             # Phase 3: Great Monument
├── phase4.html             # Phase 4: Modifications
├── phase5.html             # Phase 5: Present Day
├── css/
│   └── style.css           # Stylesheet
└── js/
├── viewer.js           # 3D viewer core
├── sound.js            # Voice narration
└── textures.js         # Realistic materials

```

## 🕹️ How to Use

| Action | Control |
|--------|---------|
| Rotate camera | Drag mouse / finger |
| Zoom in/out | Scroll / pinch |
| Change phase | Click phase buttons |
| Voice narration | Click 🔊 button (top right) |
| Fullscreen | Click ⛶ button (top right) |
| VR mode | Click VR button (top left) |

## 📱 Responsive Design

The project works on:
- Desktop computers (Chrome, Firefox, Edge, Safari)
- Mobile devices (touch controls)
- VR headsets (WebXR compatible)

## 🔧 Local Development

1. Clone the repository:
```bash
git clone https://github.com/karkirijan38/Stonehenge_evolution.git
```

1. Navigate to the project folder:

```bash
cd Stonehenge_evolution
```

1. Start a local server:

```bash
python -m http.server 8000
```

1. Open http://localhost:8000 in your browser

🌐 Browser Compatibility

Browser VR Support Voice Support
Chrome ✅ ✅
Edge ✅ ✅
Firefox ✅ ✅
Safari ⚠️ Limited ✅

📚 Sources

· Archaeological data based on English Heritage research
· LiDAR data from Environment Agency (UK)
· 3D reconstruction based on archaeological records

👨‍💻 Author

· GitHub: @karkirijan38

📄 License

This project is for educational purposes.
