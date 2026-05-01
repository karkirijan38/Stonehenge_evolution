import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== LOCAL LINKS (NOT URLs) =====
const phaseFiles = {
    0: './phase1.glb',
    1: './phase2.glb',
    2: './phase3.glb',
    3: './phase4.glb',
    4: './phase5.glb'
};


export function initViewer(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found!`);
        return;
    }

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Beautiful sky blue

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Move the camera close to the center
    camera.position.set(config.cameraX || 0, config.cameraY || 5, config.cameraZ || 15);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Saves battery on mobile
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5); // Warm sunlight
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    // 5. Procedural Grass Floor (Hides the square dirt base)
    const floorGeometry = new THREE.PlaneGeometry(300, 300);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5a8a3a, 
        roughness: 0.9 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Lay it flat
    scene.add(floor);

    // 6. Controls (Touch-friendly)
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

                // --- KING'S LOCK-ON & SCALE FIX ---
                // 1. Find the exact center of the AI model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                
                // 2. Shift the model so its exact center is at 0,0,0
                model.position.x = -center.x;
                model.position.z = -center.z;
                
                // Sink the bottom edge slightly into the grass to hide the dirt block
                model.position.y = -box.min.y - 0.5; 

                // 3. Create an invisible "Anchor" box at the center of the world
                const group = new THREE.Group();
                group.add(model); // Put the centered model inside the anchor

                // 4. NOW SCALE THE ANCHOR! (It will blow up in place, without flying away)
                // Change these numbers to 15, 20, or 30 to get the perfect size!
                group.scale.set(15, 15, 15); 
                
                scene.add(group);
                console.log(`Phase ${config.phaseIndex + 1} locked in and scaled!`);
                // ----------------------------------
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
