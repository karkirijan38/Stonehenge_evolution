// js/viewer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { createRealisticMaterials, createAtmosphere } from './textures.js';
import { initVoiceover, updateCurrentPhase } from './sound.js';

export function initViewer(containerId, phaseConfig) {
    const container = document.getElementById(containerId);
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1030);
    scene.fog = new THREE.FogExp2(0x0a1030, 0.004);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(phaseConfig.cameraX || 12, phaseConfig.cameraY || 8, phaseConfig.cameraZ || 16);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    
    // ===== VR BUTTON (Top Left) =====
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
    vrBtn.style.fontFamily = 'monospace';
    vrBtn.style.height = '28px';
    vrBtn.style.display = 'inline-flex';
    vrBtn.style.alignItems = 'center';
    vrBtn.style.justifyContent = 'center';
    document.body.appendChild(vrBtn);
    
    // ===== BUTTON CONTAINER (Top Right for Voice + Fullscreen) =====
    const rightButtonContainer = document.createElement('div');
    rightButtonContainer.style.position = 'absolute';
    rightButtonContainer.style.top = '20px';
    rightButtonContainer.style.right = '20px';
    rightButtonContainer.style.zIndex = '100';
    rightButtonContainer.style.display = 'flex';
    rightButtonContainer.style.gap = '10px';
    document.body.appendChild(rightButtonContainer);
    
    // ===== FULLSCREEN BUTTON =====
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '⛶';
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
    fullscreenBtn.style.display = 'inline-flex';
    fullscreenBtn.style.alignItems = 'center';
    fullscreenBtn.style.justifyContent = 'center';
    
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
    rightButtonContainer.appendChild(fullscreenBtn);
    
    // ===== VOICE BUTTON (added to same container) =====
    const voiceBtn = document.createElement('button');
    voiceBtn.id = 'voiceBtn';
    voiceBtn.innerHTML = '🔊 Voice';
    voiceBtn.style.padding = '6px 12px';
    voiceBtn.style.fontSize = '11px';
    voiceBtn.style.fontWeight = 'bold';
    voiceBtn.style.cursor = 'pointer';
    voiceBtn.style.background = '#4a6a3a';
    voiceBtn.style.color = 'white';
    voiceBtn.style.border = 'none';
    voiceBtn.style.borderRadius = '20px';
    voiceBtn.style.height = '28px';
    voiceBtn.style.display = 'inline-flex';
    voiceBtn.style.alignItems = 'center';
    voiceBtn.style.justifyContent = 'center';
    voiceBtn.style.gap = '4px';
    rightButtonContainer.appendChild(voiceBtn);
    
    // Voice state
    let voiceEnabled = true;
    
    const phaseVoiceTexts = {
        0: "Phase 1. Origins. 3000 BCE. Circular ditch and bank. Wooden posts. No stones yet. The first ceremonial gathering place.",
        1: "Phase 2. First Stones. 2500 BCE. Small bluestones arrive from Wales. First stone circle. About eighty bluestones arranged in an incomplete circle.",
        2: "Phase 3. Great Monument. 2200 BCE. Massive sarsen stones with trilithons. The iconic Stonehenge we recognize today.",
        3: "Phase 4. Modifications. 1500 BCE. Reorganization of stones and construction of the Avenue. A processional path to the River Avon.",
        4: "Phase 5. Present Day. UNESCO World Heritage site. Fallen stones restored. Conservation ongoing. Millions of visitors annually."
    };
    
    function speakPhase(phaseIndex) {
        // CHECK IF ON HOMEPAGE - DON'T SPEAK
        const isHomePage = window.location.pathname.includes('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/');
        
        if (!voiceEnabled) return;
        if (isHomePage) return;  // NO VOICE ON HOMEPAGE
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phaseVoiceTexts[phaseIndex]);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
    
    voiceBtn.onclick = () => {
        voiceEnabled = !voiceEnabled;
        if (voiceEnabled) {
            voiceBtn.innerHTML = '🔊 Voice';
            voiceBtn.style.background = '#4a6a3a';
            if (phaseConfig.phaseIndex !== undefined) speakPhase(phaseConfig.phaseIndex);
        } else {
            voiceBtn.innerHTML = '🔇 Mute';
            voiceBtn.style.background = '#aa3333';
            window.speechSynthesis.cancel();
        }
    };
    
    // Speak on load
    if (phaseConfig.phaseIndex !== undefined) {
        setTimeout(() => speakPhase(phaseConfig.phaseIndex), 500);
    }
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 1.0;
    controls.target.set(0, 1.5, 0);
    
    // Get realistic materials
    const { stoneMaterial, bluestoneMaterial, groundMaterial, dirtMaterial } = createRealisticMaterials();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    mainLight.position.set(8, 15, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    
    const fillLight = new THREE.PointLight(0x88aaff, 0.4);
    fillLight.position.set(-5, 8, 5);
    scene.add(fillLight);
    
    const rimLight = new THREE.PointLight(0xffaa88, 0.3);
    rimLight.position.set(0, 5, -12);
    scene.add(rimLight);
    
    // Ground
    const ground = new THREE.Mesh(new THREE.CircleGeometry(28, 64), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const innerGrass = new THREE.Mesh(new THREE.CircleGeometry(14, 64), groundMaterial);
    innerGrass.rotation.x = -Math.PI / 2;
    innerGrass.position.y = -0.55;
    innerGrass.receiveShadow = true;
    scene.add(innerGrass);
    
    // Ditch and bank rings
    const ditchRing = new THREE.Mesh(new THREE.TorusGeometry(11.5, 0.7, 128, 200), dirtMaterial);
    ditchRing.rotation.x = Math.PI / 2;
    ditchRing.position.y = -0.5;
    ditchRing.receiveShadow = true;
    scene.add(ditchRing);
    
    const bankRing = new THREE.Mesh(new THREE.TorusGeometry(13, 1.2, 128, 200), dirtMaterial);
    bankRing.rotation.x = Math.PI / 2;
    bankRing.position.y = -0.45;
    bankRing.receiveShadow = true;
    scene.add(bankRing);
    
    // Grass tufts
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x5a9a3a, roughness: 0.7 });
    for (let i = 0; i < 400; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 11 + Math.random() * 14;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const grass = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, Math.random() * 0.3 + 0.1, 3), grassMat);
        grass.position.set(x, -0.55, z);
        grass.castShadow = true;
        scene.add(grass);
    }
    
    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPositions[i*3] = (Math.random() - 0.5) * 500;
        starPositions[i*3+1] = (Math.random() - 0.5) * 100 + 20;
        starPositions[i*3+2] = (Math.random() - 0.5) * 200 - 100;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 }));
    scene.add(stars);
    
    // Create stones
    function createStone(x, z, w, h, d, materialType) {
        const material = materialType === 'bluestone' ? bluestoneMaterial : stoneMaterial;
        const stone = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        stone.position.set(x, h/2 - 0.45, z);
        stone.castShadow = true;
        return stone;
    }
    
    const stonesGroup = new THREE.Group();
    
    if (phaseConfig.showBluestones) {
        for (let i = 0; i < 28; i++) {
            const angle = (i / 28) * Math.PI * 2;
            const r = 6.8;
            const stone = createStone(Math.cos(angle) * r, Math.sin(angle) * r, 0.65, 2.0, 0.65, 'bluestone');
            stonesGroup.add(stone);
        }
    }
    
    if (phaseConfig.showSarsen) {
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const r = 9.8;
            const stone = createStone(Math.cos(angle) * r, Math.sin(angle) * r, 1.15, 3.8, 0.95, 'sarsen');
            stonesGroup.add(stone);
        }
        
        const trilithonAngles = [0, 45, 90, 135, 180];
        trilithonAngles.forEach(ang => {
            const rad = ang * Math.PI / 180;
            const r = 6.2;
            const x = Math.cos(rad) * r;
            const z = Math.sin(rad) * r;
            
            const left = createStone(x - 1.3, z, 0.85, 5.0, 1.05, 'sarsen');
            const right = createStone(x + 1.3, z, 0.85, 5.0, 1.05, 'sarsen');
            const lintel = createStone(x, z, 2.6, 0.55, 1.35, 'sarsen');
            lintel.position.y = 4.4;
            
            stonesGroup.add(left, right, lintel);
        });
    }
    
    if (phaseConfig.showFallen) {
        const fallen1 = createStone(2.5, 3.2, 1.8, 0.45, 0.85, 'sarsen');
        fallen1.rotation.z = 0.6;
        fallen1.position.y = -0.15;
        stonesGroup.add(fallen1);
        
        const fallen2 = createStone(-3.8, -2.5, 1.6, 0.45, 0.8, 'sarsen');
        fallen2.rotation.x = 0.5;
        fallen2.position.y = -0.15;
        stonesGroup.add(fallen2);
    }
    
    scene.add(stonesGroup);
    createAtmosphere(scene);
    
    // Clouds
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.15 });
    for (let i = 0; i < 6; i++) {
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random(), 6, 6), cloudMat);
        cloud.position.set((Math.random() - 0.5) * 25, 12 + Math.random() * 5, (Math.random() - 0.5) * 20);
        scene.add(cloud);
    }
    
    // Animation
    function animate() {
        controls.update();
        stars.rotation.y += 0.0002;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Hide loading
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    return { scene, camera, controls };
}