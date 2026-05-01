import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== DIRECT GITHUB PAGES LINKS =====
// This guarantees the browser finds your models without path errors
const phaseFiles = {
    0: 'https://karkirijan38.github.io/Stonehenge-evolution/Phase1.glb',
    1: 'https://karkirijan38.github.io/Stonehenge-evolution/Phase2.glb',
    2: 'https://karkirijan38.github.io/Stonehenge-evolution/Phase3.glb',
    3: 'https://karkirijan38.github.io/Stonehenge-evolution/Phase4.glb',
    4: 'https://karkirijan38.github.io/Stonehenge-evolution/Phase5.glb'
};

export function initViewer(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found!`);
        return;
    }

    // 1. Scene Setup (Sky Color)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Beautiful sky blue

    // 2. Camera Setup (Using the config from your HTML)
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(config.cameraX || 0, config.cameraY || 6, config.cameraZ || 14);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Good for mobile performance
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5); // Warm sunlight
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    // 5. Procedural Grass Floor (To hide the square dirt base)
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5a8a3a, // Match your textures.js grass color
        roughness: 0.9 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Lay it flat
    scene.add(floor);

    // 6. Controls (Touch-friendly)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stop camera from going under the grass

    // 7. Load the 3D Model
    const loader = new GLTFLoader();
    const modelUrl = phaseFiles[config.phaseIndex];

    if (modelUrl) {
        loader.load(
            modelUrl, 
            (gltf) => {
                const model = gltf.scene;

                // --- KING'S AUTO-SCALE & CENTER ALGORITHM ---
                
                // A. Measure whatever size Tripo made the model
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                
                // B. Force it to be exactly 15 units wide (Nice and big!)
                const maxDim = Math.max(size.x, size.y, size.z);
                const scaleFactor = 15 / maxDim;
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // C. Re-measure the new BIG model to find its true center
                box.setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                
                // D. Center the X and Z perfectly so the camera looks right at it
                model.position.x = -center.x;
                model.position.z = -center.z;
                
                // E. Sink the square dirt base into the procedural grass!
                // We shift it down based on its lowest point. 
                // Tweak the "- 0.5" if it needs to sink more or less.
                model.position.y = -box.min.y - 0.5; 
                
                // ---------------------------------------------

                scene.add(model);
                console.log(`Phase ${config.phaseIndex + 1} successfully loaded and scaled!`);
            }, 
            (xhr) => {
                if (xhr.lengthComputable) {
                    console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
                }
            },
            (error) => {
                console.error('CRITICAL ERROR loading model:', error);
                alert(`Error loading model for Phase ${config.phaseIndex + 1}. Check the file name and URL!`);
            }
        );
    } else {
        console.error(`No model link found for phase index: ${config.phaseIndex}`);
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
