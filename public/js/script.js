const synthSelect = document.getElementById('synth-select');

let activeSynth = new Tone.PolySynth(Tone.Synth).toDestination();

synthSelect.addEventListener('change', (event) => {
    console.log("Finding instrument")
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
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
    "C6"
];

notes.forEach(note => {
    const key = document.createElement('div');
    
    // Check if note contains '#' to determine if it's a black key
    if (note.includes('#')) {
        key.classList.add('key', 'black');
    } else {
        key.classList.add('key');
    }

    key.addEventListener('click', () => playNote(note));

    pianoContainer.appendChild(key);
});


function playNote(note) {
    console.log("Playing Notes");
    switch (synthSelect.value) {
        case 'poly':
        case 'mono':
        case 'bass':
            activeSynth.triggerAttackRelease(note, "8n");
            break;
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


// ... (rest of your JS code) ...

// Initialize MIDI
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false })
        .then(onMIDISuccess, onMIDIFailure);
} else {
    console.warn("WebMIDI is not supported in this browser.");
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
    var note = event.data[1];
    var velocity = event.data[2];

    // Assuming C2 is 36 in MIDI numbering
    var keyIndex = note - 36;

    if (event.data[0] === 144 && velocity > 0) { // note on
        document.querySelector(`#key-${keyIndex}`).classList.add('active');
    } else if (event.data[0] === 128 || (event.data[0] === 144 && velocity === 0)) { // note off
        document.querySelector(`#key-${keyIndex}`).classList.remove('active');
    }
}
