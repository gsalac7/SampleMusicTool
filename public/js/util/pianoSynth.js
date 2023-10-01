import * as Tone from 'tone';

const pianoContainer = document.getElementById('piano');
const notes = [
    "A0", "A#0", "B0",
    "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
    "C8"
];

// Initialize the active synthesizer
let activeSynth = new Tone.PolySynth(Tone.Synth).toDestination();

export function initializePianoUI() {
    // Iterate over the notes to create piano keys in the UI
    notes.forEach((note, index) => {
        const key = document.createElement('div');
        key.setAttribute('data-key-index', index);
        
        if (note.includes('#')) {
            key.classList.add('key', 'black');
        } else {
            key.classList.add('key');
        }

        key.addEventListener('click', () => playNote(note));
        pianoContainer.appendChild(key);
    });
}

export function initializeSynth(synthType) {
    switch (synthType) {
        case 'mono':
            // Add specific initialization for mono synth
            activeSynth = new Tone.MonoSynth().toDestination();
            break;
        case 'bass':
            // Add specific initialization for bass synth
            activeSynth = new Tone.MonoSynth().toDestination();
            break;
        default:
            activeSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
}

export function playNote(note) {
    activeSynth.triggerAttackRelease(note, "8n");
    
    // UI feedback for active note
    const noteIndex = notes.indexOf(note);
    const keyElement = pianoContainer.querySelector(`[data-key-index="${noteIndex}"]`);

    if (keyElement) {
        keyElement.classList.add('active');
        
        // Remove 'active' class after delay to simulate key release
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 300);
    }
}

// You can add additional functions as needed to manage the synth and UI
