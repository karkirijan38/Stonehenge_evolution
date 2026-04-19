// js/textures.js
import * as THREE from 'three';

export function createRealisticMaterials() {
    
    // Stone material (sarsen)
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xbc9a6c,
        roughness: 0.35,
        metalness: 0.1,
        flatShading: false,
        emissive: 0x221100,
        emissiveIntensity: 0.05
    });
    
    // Bluestone material
    const bluestoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b8e9e,
        roughness: 0.4,
        metalness: 0.05,
        emissive: 0x112233,
        emissiveIntensity: 0.03
    });
    
    // Ground material with procedural texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1024;
    groundCanvas.height = 1024;
    const ctx = groundCanvas.getContext('2d');
    ctx.fillStyle = '#3a6a2a';
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 8000; i++) {
        ctx.fillStyle = `rgba(50, 80, 30, ${Math.random() * 0.5})`;
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(8, 8);
    
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.9,
        metalness: 0.05,
        color: 0x5a8a3a
    });
    
    // Dirt/bank material
    const dirtCanvas = document.createElement('canvas');
    dirtCanvas.width = 512;
    dirtCanvas.height = 512;
    const dirtCtx = dirtCanvas.getContext('2d');
    dirtCtx.fillStyle = '#8a6a3a';
    dirtCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3000; i++) {
        dirtCtx.fillStyle = `rgba(100, 70, 30, ${Math.random() * 0.6})`;
        dirtCtx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
    const dirtTexture = new THREE.CanvasTexture(dirtCanvas);
    dirtTexture.wrapS = THREE.RepeatWrapping;
    dirtTexture.wrapT = THREE.RepeatWrapping;
    dirtTexture.repeat.set(4, 4);
    
    const dirtMaterial = new THREE.MeshStandardMaterial({
        map: dirtTexture,
        roughness: 0.85,
        color: 0x8a6a3a
    });
    
    return { stoneMaterial, bluestoneMaterial, groundMaterial, dirtMaterial };
}

export function createAtmosphere(scene) {
    // Floating dust particles
    const particleCount = 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i*3] = (Math.random() - 0.5) * 40;
        positions[i*3+1] = Math.random() * 5;
        positions[i*3+2] = (Math.random() - 0.5) * 40;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x88aaff,
        size: 0.05,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Animate particles
    function animateParticles() {
        requestAnimationFrame(animateParticles);
        particles.rotation.y += 0.0005;
    }
    animateParticles();
}