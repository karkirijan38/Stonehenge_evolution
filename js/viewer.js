import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== LOCAL LINKS =====
const phaseFiles = {
    0: './phase1.glb',
    1: './phase2.glb',
    2: './phase3.glb',
    3: './phase4.glb',
    4: './phase5.glb'
};

export function initViewer(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 

    // 2. Camera Setup (We will auto-move this later)
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(50, 100, 50);
    scene.add(sunLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 6. Load the 3D Model
    const loader = new GLTFLoader();
    const modelUrl = phaseFiles[config.phaseIndex];

    if (modelUrl) {
        loader.load(
            modelUrl, 
            (gltf) => {
                const model = gltf.scene;
                scene.add(model);

                // --- THE MAGIC AUTO-FRAME ---
                // 1. Measure the exact boundaries of the AI model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // 2. Force the controls to lock dead-center onto the model
                controls.target.copy(center);

                // 3. Calculate exactly how far back the camera needs to be
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                
                // Multiply by 1.5 to leave a nice border around it on the screen
                cameraZ *= 1.5; 

                // 4. Move the camera to the perfect viewing angle
                camera.position.set(center.x, center.y + (maxDim / 4), center.z + cameraZ);
                
                // 5. Update everything so it doesn't glitch!
                camera.updateProjectionMatrix();
                controls.update();
                // -----------------------------

            }, 
            (xhr) => {
                console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    // 7. Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 8. Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
