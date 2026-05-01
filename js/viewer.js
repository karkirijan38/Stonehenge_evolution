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

    // 1. Scene & Background (Muted English Sky)
    const scene = new THREE.Scene();
    const skyColor = 0x9BB0B5; // Muted grayish-blue
    scene.background = new THREE.Color(skyColor); 

    // 2. Distance Fog (Hides the edges of the 3D world)
    scene.fog = new THREE.Fog(skyColor, 20, 100);

    // 3. Camera & Renderer
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(50, 80, 40);
    scene.add(sunLight);

    // 5. Procedural Grass Floor (Color matched to your earthy models)
    const floorGeometry = new THREE.PlaneGeometry(300, 300);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7c855e, // Muted, realistic olive-green
        roughness: 0.95,
        metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 6. 🌫️ KING'S MOVING FOG SYSTEM
    // We generate a soft, puffy cloud texture using a canvas
    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = 256;
    fogCanvas.height = 256;
    const fogContext = fogCanvas.getContext('2d');
    const fogGradient = fogContext.createRadialGradient(128, 128, 0, 128, 128, 128);
    fogGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Center opacity
    fogGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');   // Fades to invisible
    fogContext.fillStyle = fogGradient;
    fogContext.fillRect(0, 0, 256, 256);
    const fogTexture = new THREE.CanvasTexture(fogCanvas);

    // Create a swarm of fog clouds
    const fogGeometry = new THREE.BufferGeometry();
    const fogCount = 60; // Enough clouds to look thick, but keeps phone fast
    const fogPositions = new Float32Array(fogCount * 3);
    for(let i = 0; i < fogCount; i++) {
        fogPositions[i*3] = (Math.random() - 0.5) * 120;     // X spread
        fogPositions[i*3+1] = Math.random() * 8 + 1;         // Y (Keeps fog close to the ground)
        fogPositions[i*3+2] = (Math.random() - 0.5) * 120;     // Z spread
    }
    fogGeometry.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));
    
    const fogMaterial = new THREE.PointsMaterial({
        size: 40, // Massive soft clouds
        map: fogTexture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false, // Stops clouds from cutting into each other
        blending: THREE.NormalBlending,
        color: 0xcad6d9 // Very light greyish-blue mist
    });
    
    const movingFog = new THREE.Points(fogGeometry, fogMaterial);
    scene.add(movingFog);
    // ------------------------------------

    // 7. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Stop camera from going underground

    // 8. Load the 3D Model
    const loader = new GLTFLoader();
    const modelUrl = phaseFiles[config.phaseIndex];

    if (modelUrl) {
        loader.load(
            modelUrl, 
            (gltf) => {
                const model = gltf.scene;

                // --- TILT FIXER (For Phases 4 & 5) ---
                if (config.phaseIndex === 3 || config.phaseIndex === 4) {
                    model.rotation.z = 25 * (Math.PI / 180); // Adjust this number if it's still tilted!
                }

                scene.add(model);

                // --- MAGIC AUTO-FRAME ---
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

                // --- NUKE THE LOADING TEXT ---
                const loadingScreens = [
                    document.getElementById('loading'),
                    document.getElementById('status'),
                    document.getElementById('loading-screen'),
                    document.querySelector('.loading')
                ];
                loadingScreens.forEach(el => {
                    if (el) el.style.display = 'none';
                });
            }, 
            (xhr) => {
                console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    // 9. Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 10. Animation Loop (Makes the fog roll!)
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        
        // Slowly rotate the entire fog cloud system so it drifts across the monument
        if (movingFog) {
            movingFog.rotation.y += 0.001;
        }

        renderer.render(scene, camera);
    }
    animate();
}
