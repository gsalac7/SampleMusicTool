import * as Tone from 'tone';
import { handleNotePlayed } from './recordingManager';

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

// object to store synths
const synths = {
    poly: new Tone.PolySynth(Tone.Synth).toDestination(),
    mono: new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1 }
    }).toDestination(),
    bass: new Tone.MonoSynth({
        oscillator: { type: 'fmsquare5' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.4 }
    }).toDestination()
};


let activeSynth = synths.poly; // Default
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

        key.addEventListener('mousedown', () => {
            activeSynth.triggerAttack(note); // Starts playing the note
            handleNotePlayed(note);
            key.classList.add('active');
        });

        key.addEventListener('mouseup', () => {
            activeSynth.triggerRelease(note); // Stops playing the specified note
            key.classList.remove('active');
        });

        key.addEventListener('mouseleave', () => {
            activeSynth.triggerRelease(note); // Stops playing the specified note
            key.classList.remove('active');
        });


        pianoContainer.appendChild(key);
    });
}

export function initializeSynth() {
    const synthSelectElement = document.getElementById('synth-select');

    if (!synthSelectElement) {
        console.error('Synth select element not found');
        return;
    }

    // Set the initial active synth based on the select value
    setActiveSynth(synthSelectElement.value);

    // Set up event listener on synth-select
    synthSelectElement.addEventListener('change', (event) => {
        setActiveSynth(event.target.value);
    });
}

export function setActiveSynth(synthType) {
    activeSynth = synths[synthType];
}


export function playNote(note, velocity = 1) {
    // Adjust volume or other parameters using velocity
    // Example: set the volume value or apply it to the gain, etc.
    activeSynth.volume.value = convertVelocityToVolume(velocity); 
    activeSynth.triggerAttack(note); // Removed "8n", as the release will be handled by stopNote

    // UI feedback for active note
    const noteIndex = notes.indexOf(note);
    const keyElement = pianoContainer.querySelector(`[data-key-index="${noteIndex}"]`);
    handleNotePlayed(note);

    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function convertVelocityToVolume(velocity) {
    // Implement your conversion logic here
    // Example: linear mapping (adjust as needed)
    return velocity * maxVolume;
}

const maxVolume = 0; // 0 dB is full volume in Tone.js


export function startNote(noteString, velocity) {
    // You can incorporate velocity into playNote if necessary
    playNote(noteString, velocity); // playNote function will handle UI feedback for starting note
}

export function stopNote(noteString) {
    // Stop playing the note
    activeSynth.triggerRelease(noteString); 

    // UI feedback for note off
    const noteIndex = notes.indexOf(noteString);
    const keyElement = pianoContainer.querySelector(`[data-key-index="${noteIndex}"]`);
    
    if (keyElement) {
        keyElement.classList.remove('active'); // Remove 'active' class for note off
    } else {
        console.warn(`No key element found for note ${noteString}`);
    }
}

