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

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(50, 100, 50);
    scene.add(sunLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new GLTFLoader();
    const modelUrl = phaseFiles[config.phaseIndex];

    if (modelUrl) {
        loader.load(
            modelUrl, 
            (gltf) => {
                const model = gltf.scene;

                // --- 👑 THE TILT FIXER (For Phases 4 & 5) ---
                // config.phaseIndex 3 is Phase 4, config.phaseIndex 4 is Phase 5
                if (config.phaseIndex === 3 || config.phaseIndex === 4) {
                    
                    // Change these numbers to level out your model! 
                    // Positive Z tilts it Left. Negative Z tilts it Right.
                    const tiltForwardBack = 0; // X axis
                    const tiltLeftRight = 25;  // Z axis (I guessed 25 degrees left to fix your right-tilt)
                    
                    model.rotation.x = tiltForwardBack * (Math.PI / 180);
                    model.rotation.z = tiltLeftRight * (Math.PI / 180);
                }
                // --------------------------------------------

                scene.add(model);

                // --- THE MAGIC AUTO-FRAME ---
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                controls.target.copy(center);

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5; 

                camera.position.set(center.x, center.y + (maxDim / 4), center.z + cameraZ);
                
                camera.updateProjectionMatrix();
                controls.update();

                // --- 🛑 NUKE THE LOADING TEXT ---
                // This searches your HTML for anything acting like a loading screen and hides it!
                const loadingScreens = [
                    document.getElementById('loading'),
                    document.getElementById('status'),
                    document.getElementById('loading-screen'),
                    document.querySelector('.loading')
                ];
                loadingScreens.forEach(el => {
                    if (el) el.style.display = 'none';
                });
                // --------------------------------

            }, 
            (xhr) => {
                console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
