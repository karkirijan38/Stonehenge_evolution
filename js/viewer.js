// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== LOCAL GLB FILES =====
const phaseFiles = {
    0: '/Stonehenge-evolution/models/Phase1.glb',
    1: '/Stonehenge-evolution/models/Phase2.glb',
    2: '/Stonehenge-evolution/models/Phase3.glb',
    3: '/Stonehenge-evolution/models/Phase4.glb',
    4: '/Stonehenge-evolution/models/Phase5.glb'
};

let currentModel = null;
let scene, camera, renderer, controls;
let voiceEnabled = true;
let currentPhaseIndex = 0;

export function initViewer(containerId, phaseConfig) {
    const container = document.getElementById(containerId);
    currentPhaseIndex = phaseConfig.phaseIndex;

    // ===== SCENE =====
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 60);

    // ===== CAMERA =====
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(
        phaseConfig.cameraX || 12,
        phaseConfig.cameraY || 8,
        phaseConfig.cameraZ || 16
    );

    // ===== RENDERER =====
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // ===== VR BUTTON =====
    const vrBtn = VRButton.createButton(renderer);
    vrBtn.style.position = 'absolute';
    vrBtn.style.top = '20px';
    vrBtn.style.left = '20px';
    document.body.appendChild(vrBtn);

    // ===== CONTROLS =====
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    // ===== LIGHTING =====
    scene.add(new THREE.AmbientLight(0x404060, 0.6));

    const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sun.position.set(10, 20, 5);
    sun.castShadow = true;
    scene.add(sun);

    // ===== GROUND =====
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(25, 32),
        new THREE.MeshStandardMaterial({ color: 0x5a8a3a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    scene.add(ground);

    // ===== LOADING TEXT =====
    const loading = document.getElementById('loading');

    // ===== MODEL LOADER =====
    const loader = new GLTFLoader();
    const modelPath = phaseFiles[currentPhaseIndex];

    console.log("Loading:", modelPath);

    loader.load(
        modelPath,

        // ✅ SUCCESS
        (gltf) => {
            if (currentModel) scene.remove(currentModel);

            currentModel = gltf.scene;
            currentModel.position.y = -0.4;
            currentModel.scale.set(0.8, 0.8, 0.8);

            currentModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(currentModel);

            console.log("✅ Model loaded");

            if (loading) loading.style.display = 'none';
        },

        // 🔄 PROGRESS
        (xhr) => {
            if (xhr.total) {
                const percent = (xhr.loaded / xhr.total) * 100;
                console.log(percent.toFixed(0) + "% loaded");
            }
        },

        // ❌ ERROR
        (error) => {
            console.error("❌ GLB LOAD ERROR:", error);

            if (loading) {
                loading.innerHTML = "❌ Failed to load model";
            }
        }
    );

    // ===== ANIMATION =====
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // ===== RESIZE =====
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera };
}
