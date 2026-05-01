// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let currentModel = null;
let scene, camera, renderer, controls;

const phaseFiles = {
    0: 'phase1.glb',
    1: 'phase2.glb',
    2: 'phase3.glb',
    3: 'phase4.glb',
    4: 'phase5.glb'
};

export function initViewer(containerId, phaseConfig) {
    const container = document.getElementById(containerId);
    const phaseIndex = phaseConfig.phaseIndex;
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 60);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(phaseConfig.cameraX || 8, phaseConfig.cameraY || 6, phaseConfig.cameraZ || 12);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 1, 0);
    
    // Lights - BRIGHT enough
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const fillLight = new THREE.PointLight(0x88aaff, 0.4);
    fillLight.position.set(-3, 5, 4);
    scene.add(fillLight);
    
    const backLight = new THREE.PointLight(0xffaa66, 0.3);
    backLight.position.set(0, 3, -6);
    scene.add(backLight);
    
    const groundLight = new THREE.PointLight(0x88aacc, 0.2);
    groundLight.position.set(0, -2, 0);
    scene.add(groundLight);
    
    // Ground
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(20, 32), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 20, 0x88aacc, 0x446688);
    gridHelper.position.y = -0.45;
    scene.add(gridHelper);
    
    // Load GLB
    const loader = new GLTFLoader();
    const modelPath = phaseFiles[phaseIndex];
    
    if (modelPath) {
        loader.load(modelPath,
            (gltf) => {
                if (currentModel) scene.remove(currentModel);
                currentModel = gltf.scene;
                currentModel.position.y = -0.3;
                currentModel.scale.set(0.8, 0.8, 0.8);
                currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(currentModel);
                console.log('Model loaded');
            },
            (xhr) => {
                console.log(Math.round(xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
                console.error('Error:', error);
            }
        );
    }
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    return { scene, camera, controls };
}
