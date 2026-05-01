import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let currentModel = null;

export async function initViewer(containerId, phaseConfig) {

    const container = document.getElementById(containerId);
    const phaseIndex = phaseConfig.phaseIndex;

    // ✅ SIMPLE PATH (NO basePath headaches)
    const phaseFiles = {
        0: '/models/Phase1.glb',
        1: '/models/Phase2.glb',
        2: '/models/Phase3.glb',
        3: '/models/Phase4.glb',
        4: '/models/Phase5.glb'
    };

    console.log("📦 Loading:", phaseFiles[phaseIndex]);

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

    // ===== LOADER =====
    const loader = new GLTFLoader();

    // DRACO
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    // 🔥 CRITICAL: Meshopt (async CDN)
    const { MeshoptDecoder } = await import(
        'https://unpkg.com/meshopt_decoder@0.18.1/meshopt_decoder.module.js'
    );
    loader.setMeshoptDecoder(MeshoptDecoder);

    // ===== LOAD MODEL =====
    loader.load(
        phaseFiles[phaseIndex],

        (gltf) => {
            console.log("✅ MODEL LOADED");

            if (currentModel) scene.remove(currentModel);

            currentModel = gltf.scene;
            currentModel.scale.set(0.8, 0.8, 0.8);

            scene.add(currentModel);

            if (loading) loading.style.display = 'none';
        },

        (xhr) => {
            if (xhr.total) {
                console.log(`⏳ ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
            }
        },

        (error) => {
            console.error("❌ LOAD ERROR:", error);
            if (loading) loading.innerHTML = "❌ Failed to load model";
        }
    );

    // ===== LOOP =====
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
