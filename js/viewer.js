// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== DROPBOX GLB LINKS =====
const phaseFiles = {
    0: 'https://www.dropbox.com/scl/fi/q8s8lhf81nn618ujoviid/Phase1.glb?rlkey=8d240dkwdz9o9hit9uz8q4j1p&st=ufoiod8c&dl=1',
    1: 'https://www.dropbox.com/scl/fi/gug753zotsb7oh2n3vnc1/Phase2.glb?rlkey=now6b4bralgqpas089hlyiv9b&st=4egueher&dl=1',
    2: 'https://www.dropbox.com/scl/fi/2im3qmfb5uxxx685vyfk4/Phase3.glb?rlkey=hg851yj9iqpvkdmrwhnj7yn2f&st=mei36a4q&dl=1',
    3: 'https://www.dropbox.com/scl/fi/u87bj7vy1chumsdgtcyqu/Phase4.glb?rlkey=4hfk1uaiyr0yus47fqmsw0q8u&st=ylfzysz6&dl=1',
    4: 'https://www.dropbox.com/scl/fi/xl0oi1tup8g3ludzoucma/Phase5.glb?rlkey=3nkx3khxx50fa04xms4rm3k3u&st=ad79iiq2&dl=1'
};

let currentModel = null;
let scene, camera, renderer, controls;
let voiceEnabled = true;
let currentPhaseIndex = 0;

export function initViewer(containerId, phaseConfig) {
    const container = document.getElementById(containerId);
    currentPhaseIndex = phaseConfig.phaseIndex;
    
    // ===== SCENE SETUP =====
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 60);
    
    // ===== CAMERA =====
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(phaseConfig.cameraX || 12, phaseConfig.cameraY || 8, phaseConfig.cameraZ || 16);
    
    // ===== RENDERER WITH VR =====
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    
    // ===== VR BUTTON =====
    const vrBtn = VRButton.createButton(renderer);
    vrBtn.style.position = 'absolute';
    vrBtn.style.top = '20px';
    vrBtn.style.left = '20px';
    vrBtn.style.zIndex = '100';
    vrBtn.style.padding = '4px 10px';
    vrBtn.style.fontSize = '11px';
    vrBtn.style.fontWeight = 'bold';
    vrBtn.style.cursor = 'pointer';
    vrBtn.style.background = '#d4a017';
    vrBtn.style.color = 'black';
    vrBtn.style.border = 'none';
    vrBtn.style.borderRadius = '4px';
    vrBtn.style.height = '28px';
    document.body.appendChild(vrBtn);
    
    // ===== FULLSCREEN BUTTON =====
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.style.position = 'absolute';
    fullscreenBtn.style.top = '20px';
    fullscreenBtn.style.right = '20px';
    fullscreenBtn.style.zIndex = '100';
    fullscreenBtn.style.padding = '6px 12px';
    fullscreenBtn.style.fontSize = '14px';
    fullscreenBtn.style.fontWeight = 'bold';
    fullscreenBtn.style.cursor = 'pointer';
    fullscreenBtn.style.background = '#4a6a3a';
    fullscreenBtn.style.color = 'white';
    fullscreenBtn.style.border = 'none';
    fullscreenBtn.style.borderRadius = '20px';
    fullscreenBtn.style.height = '28px';
    fullscreenBtn.style.width = '40px';
    
    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.innerHTML = '✖';
            fullscreenBtn.style.background = '#d4a017';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '⛶';
            fullscreenBtn.style.background = '#4a6a3a';
        }
    };
    document.body.appendChild(fullscreenBtn);
    
    // ===== VOICE BUTTON =====
    const voiceBtn = document.createElement('button');
    voiceBtn.innerHTML = '🔊 Voice';
    voiceBtn.style.position = 'absolute';
    voiceBtn.style.top = '20px';
    voiceBtn.style.right = '80px';
    voiceBtn.style.zIndex = '100';
    voiceBtn.style.padding = '6px 12px';
    voiceBtn.style.fontSize = '11px';
    voiceBtn.style.fontWeight = 'bold';
    voiceBtn.style.cursor = 'pointer';
    voiceBtn.style.background = '#4a6a3a';
    voiceBtn.style.color = 'white';
    voiceBtn.style.border = 'none';
    voiceBtn.style.borderRadius = '20px';
    voiceBtn.style.height = '28px';
    
    const phaseVoiceTexts = {
        0: "Phase 1. Origins. 3000 BCE. Circular ditch and bank. Wooden posts. No stones yet.",
        1: "Phase 2. First Stones. 2500 BCE. Small bluestones arrive from Wales. First stone circle.",
        2: "Phase 3. Great Monument. 2200 BCE. Massive sarsen stones with trilithons. The iconic Stonehenge.",
        3: "Phase 4. Modifications. 1500 BCE. Reorganization of stones and Avenue construction.",
        4: "Phase 5. Present Day. UNESCO World Heritage site. Millions of visitors annually."
    };
    
    function speakPhase() {
        if (!voiceEnabled) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phaseVoiceTexts[currentPhaseIndex]);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
    
    voiceBtn.onclick = () => {
        voiceEnabled = !voiceEnabled;
        if (voiceEnabled) {
            voiceBtn.innerHTML = '🔊 Voice';
            voiceBtn.style.background = '#4a6a3a';
            speakPhase();
        } else {
            voiceBtn.innerHTML = '🔇 Mute';
            voiceBtn.style.background = '#aa3333';
            window.speechSynthesis.cancel();
        }
    };
    document.body.appendChild(voiceBtn);
    
    // ===== CONTROLS =====
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 2, 0);
    
    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(10, 20, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    
    const fillLight = new THREE.PointLight(0x88aaff, 0.4);
    fillLight.position.set(-5, 8, 5);
    scene.add(fillLight);
    
    const rimLight = new THREE.PointLight(0xffaa88, 0.3);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);
    
    // ===== GROUND =====
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(25, 32), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // ===== GRASS TUFTS =====
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a });
    for (let i = 0; i < 600; i++) {
        const grass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, Math.random() * 0.2 + 0.1, 3), grassMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 9 + Math.random() * 14;
        grass.position.x = Math.cos(angle) * radius;
        grass.position.z = Math.sin(angle) * radius;
        grass.position.y = -0.55;
        grass.castShadow = true;
        scene.add(grass);
    }
    
    // ===== LOAD GLB MODEL =====
    const loader = new GLTFLoader();
    const modelPath = phaseFiles[phaseConfig.phaseIndex];
    
    if (modelPath) {
        console.log('Loading model from:', modelPath);
        loader.load(modelPath, (gltf) => {
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
            console.log('Model loaded successfully');
            setTimeout(speakPhase, 500);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('Error loading model:', error);
        });
    }
    
    // ===== KILL VOICE ON NAVIGATION =====
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            window.speechSynthesis.cancel();
        });
    });
    
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
    
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    return { scene, camera, controls };
}