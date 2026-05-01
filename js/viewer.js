import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== DIRECT GITHUB PAGES LINKS =====
const phaseFiles = {
    0: 'https://karkirijan38.github.io/Stonehenge-evolution/phase1.glb',
    1: 'https://karkirijan38.github.io/Stonehenge-evolution/phase2.glb',
    2: 'https://karkirijan38.github.io/Stonehenge-evolution/phase3.glb',
    3: 'https://karkirijan38.github.io/Stonehenge-evolution/phase4.glb',
    4: 'https://karkirijan38.github.io/Stonehenge-evolution/phase5.glb'
};

export function initViewer(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found!`);
        return;
    }

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Move the camera relatively close
    camera.position.set(config.cameraX || 0, config.cameraY || 5, config.cameraZ || 15);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    // 5. Procedural Grass Floor
    const floorGeometry = new THREE.PlaneGeometry(300, 300); // Made the floor bigger
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5a8a3a, 
        roughness: 0.9 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 6. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stop camera from going underground

    // 7. Load the 3D Model
    const loader = new GLTFLoader();
    const modelUrl = phaseFiles[config.phaseIndex];

    if (modelUrl) {
        loader.load(
            modelUrl, 
            (gltf) => {
                const model = gltf.scene;

                // --- BRUTE FORCE SCALE & POSITION ---
                // If it's still too small, change 30 to 50, 100, or 200!
                // If it's way too huge now, drop it to 10 or 5.
                model.scale.set(30, 30, 30);
                
                // Center it at (0,0) and sink it down by -2 to hide the dirt box under the grass
                model.position.set(0, -2, 0);
                // ------------------------------------

                scene.add(model);
                console.log(`Phase ${config.phaseIndex + 1} loaded with Brute Force Scale!`);
            }, 
            (xhr) => {
                console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    // 8. Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 9. Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
}
