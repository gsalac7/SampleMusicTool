const synthSelect = document.getElementById('synth-select');

let activeSynth = new Tone.PolySynth(Tone.Synth).toDestination();

synthSelect.addEventListener('change', (event) => {
    switch (event.target.value) {
        case 'poly':
            activeSynth = new Tone.PolySynth(Tone.Synth).toDestination();
            break;
        case 'mono':
            activeSynth = new Tone.MonoSynth({
                oscillator: {
                    type: 'sawtooth'
                },
                envelope: {
                    attack: 0.1
                }
            }).toDestination();
            break;
        case 'bass':
            activeSynth = new Tone.MonoSynth({
                oscillator: {
                    type: 'fmsquare5', 
                    modulationType: 'triangle',
                    modulationIndex: 2,
                    harmonicity: 0.501
                },
                volume: -10,
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.4,
                    release: 1.4,
                    attackCurve: 'exponential'
                }
            }).toDestination();
            break;
    }
});

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

let currentStep = 0; // For tracking the current step while recording
function playNote(note) {
    console.log("Playing Notes");
    switch (synthSelect.value) {
        case 'poly':
        case 'mono':
        case 'bass':
            activeSynth.triggerAttackRelease(note, "8n");
            break;
    }
    // Find the note's index to add the 'active' class on click
    const noteIndex = notes.indexOf(note);
    const keyElement = pianoContainer.querySelector(`[data-key-index="${noteIndex}"]`);

    if (keyElement) {
        keyElement.classList.add('active');
        
        // Remove 'active' class after a delay to simulate key release
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 300);
    }
    // Record the note if we're currently recording
    if (isRecording) {
        const pitch = Tone.Frequency(note).toMidi();
        sequence.notes.push({
            pitch,
            quantizedStartStep: currentStep,
            quantizedEndStep: currentStep + 4 // you can modify this value
        });

        // Increment the current step
        currentStep += 4;  // Assuming you're recording 1/4 notes (4 steps per quarter)
        
        // Also update the totalQuantizedSteps
        sequence.totalQuantizedSteps = Math.max(sequence.totalQuantizedSteps, currentStep);
        console.log("Note Sequence: ", JSON.stringify(sequence));

        // Redraw the visualizer
        viz.redraw(sequence, viz.config);
    }
}

const themeSwitch = document.getElementById('theme-switch');

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
});

// Midi Code
function initializeMidi() {
    // Initialize MIDI
    console.log("Initializing MIDI");
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false })
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("WebMIDI is not supported in this browser.");
    }
}
function onMIDISuccess(midiAccess) {
    var inputs = midiAccess.inputs.values();

    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure() {
    console.warn("Failed to get MIDI access.");
}

function onMIDIMessage(event) {
    let midiNote = event.data[1];
    let velocity = event.data[2];

    // Find the note string corresponding to the MIDI note number
    var noteString = notes.find(note => Tone.Frequency(note).toMidi() === midiNote);

    console.log(`MIDI Note: ${midiNote}, Note String: ${noteString}, Velocity: ${velocity}`);

    let keyIndex = notes.indexOf(noteString);  // Get the index of the note string in the notes array

    const keyElement = pianoContainer.querySelector(`[data-key-index="${keyIndex}"]`);
    if (!keyElement) return;  // skip if the key doesn't exist on the screen

    if (noteString) {
        if (event.data[0] === 144 && velocity > 0) { // note on
            playNote(noteString);  // play the note
            keyElement.classList.add('active');  // light up the key
        } else if (event.data[0] === 128 || (event.data[0] === 144 && velocity === 0)) { // note off
            keyElement.classList.remove('active');  // unlight the key
        }
    }
}


// Initialize recording state
let isRecording = false;

// Initialize your note sequence here
let sequence = {
    notes: [
        { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4 },  // C4
        { pitch: 64, quantizedStartStep: 4, quantizedEndStep: 8 },  // E4
        { pitch: 67, quantizedStartStep: 8, quantizedEndStep: 12 }, // G4
        { pitch: 72, quantizedStartStep: 12, quantizedEndStep: 16 } // C5
    ],
    totalQuantizedSteps: 16,
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 60 }],
    timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
};

initializeMidi();

const viz = new mm.Visualizer(sequence, document.getElementById('container'));
console.log("Viz initialized")

// Event Listener for toggle recording
document.getElementById("toggleRecording").addEventListener("click", () => {
  isRecording = !isRecording;
  const buttonElement = document.getElementById("toggleRecording");
  
  if (isRecording) {
    buttonElement.classList.add('recording');
    buttonElement.innerText = 'Stop Recording';
    console.log("Stop Recording")
    currentStep = 0;
    // Start recording logic here
    // Add notes to the `sequence.notes` array as they are recorded.
  } else {
    buttonElement.classList.remove('recording');
    buttonElement.innerText = 'Start Recording';
    console.log("Start Recording")
    // Stop recording logic here
    // Redraw the visualizer.
    viz.redraw(sequence, viz.config);
    currentStep = 0;
    sequence.notes = [];
  }
});


