// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// ===== BASE PATH (GitHub Pages safe) =====
const basePath = window.location.hostname.includes('github.io')
    ? '/Stonehenge_evolution/'
    : './';

// ===== MODEL PATHS =====
const phaseFiles = {
    0: basePath + 'models/Phase1.glb',
    1: basePath + 'models/Phase2.glb',
    2: basePath + 'models/Phase3.glb',
    3: basePath + 'models/Phase4.glb',
    4: basePath + 'models/Phase5.glb'
};

let currentModel = null;

export function initViewer(containerId, phaseConfig) {
    const container = document.getElementById(containerId);
    const phaseIndex = phaseConfig.phaseIndex;

    console.log("📦 Phase:", phaseIndex);
    console.log("📁 Path:", phaseFiles[phaseIndex]);

    // ===== SCENE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 60);

    // ===== CAMERA =====
    const camera = new THREE.PerspectiveCamera(
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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ===== CONTROLS =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    // ===== LIGHTING =====
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
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

    // ===== LOADING UI =====
    const loading = document.getElementById('loading');

    // ===== GLTF LOADER =====
    const loader = new GLTFLoader();
    loader.setCrossOrigin('anonymous');

    // ✅ DRACO SUPPORT
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    // ✅ MESHOPT SUPPORT (CRITICAL)
    loader.setMeshoptDecoder(MeshoptDecoder);

    // ===== LOAD MODEL =====
    loader.load(
        phaseFiles[phaseIndex],

        // ✅ SUCCESS
        (gltf) => {
            console.log("✅ Model loaded");

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

            if (loading) loading.style.display = 'none';
        },

        // 🔄 PROGRESS
        (xhr) => {
            if (xhr.total) {
                const percent = (xhr.loaded / xhr.total) * 100;
                console.log(`⏳ ${percent.toFixed(0)}% loaded`);
            }
        },

        // ❌ ERROR
        (error) => {
            console.error("❌ LOAD FAILED:", error);

            if (loading) {
                loading.innerHTML = "❌ Failed to load 3D model";
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

    return { scene, camera, controls };
}            }
        },

        // ❌ ERROR
        (error) => {
            console.error("❌ MODEL LOAD FAILED:", error);

            if (loading) {
                loading.innerHTML = "❌ Failed to load 3D model";
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

    return { scene, camera, controls };
}
