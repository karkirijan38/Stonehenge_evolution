// js/sound.js
let voiceEnabled = true;
let currentPhase = 0;
let selectedVoice = null;

// Check if current page is homepage
function isHomePage() {
    const path = window.location.pathname;
    return path.includes('index.html') || path === '/' || path.endsWith('/') || path === '';
}

// Enhanced voiceover descriptions
const phaseVoiceTexts = {
    0: `Phase 1. Origins. 3000 BCE. Long before the stones, Stonehenge began as a simple circular ditch and bank. The Aubrey Holes contained cremation burials, making this one of the earliest known cremation cemeteries in Britain.`,
    1: `Phase 2. First Stones. 2500 BCE. The first stones arrived at Stonehenge. These were the bluestones, weighing up to four tons each, quarried in the Preseli Hills of Wales, over 140 miles away.`,
    2: `Phase 3. Great Monument. 2200 BCE. The iconic Stonehenge we recognize today was built. Massive sarsen stones, each weighing up to 25 tons, were brought from the Marlborough Downs. The outer circle of thirty sarsens supports continuous lintels, while inside, five great trilithons stand in a horseshoe arrangement.`,
    3: `Phase 4. Modifications. 1500 BCE. During the Bronze Age, the bluestones were rearranged. The Avenue, a processional pathway, was constructed connecting Stonehenge to the River Avon.`,
    4: `Phase 5. Present Day. Today, Stonehenge is a UNESCO World Heritage Site. Millions of visitors come each year to witness the summer solstice sunrise, continuing a tradition that spans over five thousand years.`
};

// Try to get a natural sounding voice
function getBestVoice() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = [
            'Google UK English Female',
            'Google US English Female',
            'Samantha',
            'Google UK English Male',
            'Daniel'
        ];
        
        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name === preferred);
            if (voice) {
                resolve(voice);
                return;
            }
        }
        
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        resolve(englishVoice || voices[0]);
    });
}

export function initVoiceover() {
    // DO NOTHING ON HOMEPAGE
    if (isHomePage()) {
        console.log('Voiceover: Homepage detected - skipping initialization');
        return;
    }
    
    console.log('Voiceover: Initializing for phase page');
    
    // Preload voices
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            getBestVoice().then(voice => selectedVoice = voice);
        };
    } else {
        getBestVoice().then(voice => selectedVoice = voice);
    }
    
    // Remove existing button if any
    const existingBtn = document.getElementById('speakerBtn');
    if (existingBtn) existingBtn.remove();
    
    // Find or create button container
    let buttonContainer = document.querySelector('.voice-button-container');
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.className = 'voice-button-container';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '20px';
        buttonContainer.style.right = '100px';
        buttonContainer.style.zIndex = '100';
        document.body.appendChild(buttonContainer);
    }
    
    const speakerBtn = document.createElement('button');
    speakerBtn.id = 'speakerBtn';
    speakerBtn.innerHTML = '🔊 Voice';
    speakerBtn.style.padding = '6px 12px';
    speakerBtn.style.fontSize = '11px';
    speakerBtn.style.fontWeight = 'bold';
    speakerBtn.style.cursor = 'pointer';
    speakerBtn.style.background = '#4a6a3a';
    speakerBtn.style.color = 'white';
    speakerBtn.style.border = 'none';
    speakerBtn.style.borderRadius = '20px';
    speakerBtn.style.fontFamily = 'monospace';
    speakerBtn.style.height = '28px';
    speakerBtn.style.display = 'inline-flex';
    speakerBtn.style.alignItems = 'center';
    speakerBtn.style.justifyContent = 'center';
    buttonContainer.appendChild(speakerBtn);
    
    speakerBtn.onclick = (e) => {
        e.stopPropagation();
        voiceEnabled = !voiceEnabled;
        if (voiceEnabled) {
            speakerBtn.innerHTML = '🔊 Voice';
            speakerBtn.style.background = '#4a6a3a';
            speakCurrentPhase();
        } else {
            speakerBtn.innerHTML = '🔇 Mute';
            speakerBtn.style.background = '#aa3333';
            window.speechSynthesis.cancel();
        }
    };
}

export function stopVoiceover() {
    window.speechSynthesis.cancel();
}

export function speakPhase(phaseIndex) {
    // DO NOT SPEAK ON HOMEPAGE
    if (isHomePage()) {
        console.log('Voiceover: Homepage detected - not speaking');
        return;
    }
    
    if (!voiceEnabled) return;
    
    currentPhase = phaseIndex;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(phaseVoiceTexts[phaseIndex]);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
    } else {
        getBestVoice().then(voice => {
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        });
    }
}

function speakCurrentPhase() {
    if (voiceEnabled && !isHomePage()) {
        speakPhase(currentPhase);
    }
}

export function updateCurrentPhase(phaseIndex) {
    // DO NOT UPDATE ON HOMEPAGE
    if (isHomePage()) return;
    
    currentPhase = phaseIndex;
    speakPhase(phaseIndex);
}