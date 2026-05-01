// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let currentModel = null;

export async function initViewer(containerId, phaseConfig) {

    const container = document.getElementById(containerId);
    const phaseIndex = phaseConfig.phaseIndex;

    // ✅ SIMPLE + RELIABLE PATHS
    const phaseFiles = {
        0: '/models/Phase1.glb',
        1: '/models/Phase2.glb',
        2: '/models/Phase3.glb',
        3: '/models/Phase4.glb',
        4: '/models/Phase5.glb'
    };

    console.log("📦 Loading model:", phaseFiles[phaseIndex]);

    // ===== SCENE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    // ===== CAMERA =====
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(12, 8, 16);

    // ===== RENDERER =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // ===== CONTROLS =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ===== LIGHT =====
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

    // ===== LOADING UI =====
    const loading = document.getElementById('loading');

    // ===== GLTF LOADER =====
    const loader = new GLTFLoader();

    // ✅ DRACO SUPPORT
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    // ✅ MESHOPT (FULLY INITIALIZED - FIXES INFINITE LOADING)
    const meshoptModule = await import(
        'https://unpkg.com/meshopt_decoder@0.18.1/meshopt_decoder.module.js'
    );

    await meshoptModule.default.ready;

    loader.setMeshoptDecoder(meshoptModule.default);

    console.log("✅ Decoders ready");

    // ===== LOAD MODEL =====
    loader.load(
        phaseFiles[phaseIndex],

        // SUCCESS
        (gltf) => {
            console.log("✅ MODEL LOADED SUCCESSFULLY");

            if (currentModel) scene.remove(currentModel);

            currentModel = gltf.scene;
            currentModel.scale.set(0.8, 0.8, 0.8);
            currentModel.position.y = -0.4;

            currentModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(currentModel);

            if (loading) loading.style.display = 'none';
        },

        // PROGRESS
        (xhr) => {
            if (xhr.total) {
                const percent = (xhr.loaded / xhr.total) * 100;
                console.log(`⏳ ${percent.toFixed(0)}% loaded`);
            }
        },

        // ERROR
        (error) => {
            console.error("❌ MODEL LOAD ERROR:", error);

            if (loading) {
                loading.innerHTML = "❌ Failed to load 3D model";
            }
        }
    );

    // ===== ANIMATION LOOP =====
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
}
