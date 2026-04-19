// js/sound.js
let voiceEnabled = true;
let currentPhase = 0;
let selectedVoice = null;

// CHECK IF ON HOMEPAGE
function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '' || path.includes('index.html') || path.endsWith('/');
}

const phaseVoiceTexts = {
    0: `Phase 1. Origins. 3000 BCE. Long before the stones, Stonehenge began as a simple circular ditch and bank.`,
    1: `Phase 2. First Stones. 2500 BCE. The first stones arrived at Stonehenge. These were the bluestones from Wales.`,
    2: `Phase 3. Great Monument. 2200 BCE. Massive sarsen stones with trilithons. The iconic Stonehenge we recognize today.`,
    3: `Phase 4. Modifications. 1500 BCE. Reorganization of stones and construction of the Avenue.`,
    4: `Phase 5. Present Day. UNESCO World Heritage site. Millions of visitors each year.`
};

function getBestVoice() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = ['Google UK English Female', 'Google US English Female', 'Samantha'];
        for (const p of preferred) {
            const voice = voices.find(v => v.name === p);
            if (voice) {
                resolve(voice);
                return;
            }
        }
        resolve(voices.find(v => v.lang.startsWith('en')) || voices[0]);
    });
}

export function initVoiceover() {
    // DON'T INITIALIZE ON HOMEPAGE
    if (isHomePage()) {
        console.log('Voiceover disabled on homepage');
        return;
    }
    
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = () => getBestVoice().then(v => selectedVoice = v);
    } else {
        getBestVoice().then(v => selectedVoice = v);
    }
    
    const existingBtn = document.getElementById('speakerBtn');
    if (existingBtn) existingBtn.remove();
    
    let container = document.querySelector('.voice-button-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'voice-button-container';
        container.style.position = 'absolute';
        container.style.top = '20px';
        container.style.right = '100px';
        container.style.zIndex = '100';
        document.body.appendChild(container);
    }
    
    const btn = document.createElement('button');
    btn.id = 'speakerBtn';
    btn.innerHTML = '🔊 Voice';
    btn.style.padding = '6px 12px';
    btn.style.fontSize = '11px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.background = '#4a6a3a';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '20px';
    btn.style.height = '28px';
    container.appendChild(btn);
    
    btn.onclick = (e) => {
        e.stopPropagation();
        voiceEnabled = !voiceEnabled;
        if (voiceEnabled) {
            btn.innerHTML = '🔊 Voice';
            btn.style.background = '#4a6a3a';
            if (currentPhase !== undefined) speakPhase(currentPhase);
        } else {
            btn.innerHTML = '🔇 Mute';
            btn.style.background = '#aa3333';
            window.speechSynthesis.cancel();
        }
    };
}

export function speakPhase(phaseIndex) {
    // DON'T SPEAK ON HOMEPAGE
    if (isHomePage()) return;
    if (!voiceEnabled) return;
    
    currentPhase = phaseIndex;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(phaseVoiceTexts[phaseIndex]);
    utterance.rate = 0.9;
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        getBestVoice().then(voice => {
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        });
        return;
    }
    window.speechSynthesis.speak(utterance);
}

export function updateCurrentPhase(phaseIndex) {
    if (isHomePage()) return;
    currentPhase = phaseIndex;
    speakPhase(phaseIndex);
}

export function stopVoiceover() {
    window.speechSynthesis.cancel();
}
