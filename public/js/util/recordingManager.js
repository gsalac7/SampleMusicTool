import { Midi } from '@tonejs/midi'

let isRecording = false;
let sequence = {
    notes: [],
    totalQuantizedSteps: 0,
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
};
let currentStep = 0;
let startTime;
let bpm = 120;

// Initialize the recording
function initializeRecording(buttonId) {
    const buttonElement = document.getElementById(buttonId);
    buttonElement.addEventListener('click', toggleRecording);
}

// Toggle the recording state
function toggleRecording() {
    isRecording = !isRecording;
    const buttonElement = document.getElementById("toggleRecording");
    console.log("Toggle Recording");

    if (isRecording) {
        startTime = Date.now();
        buttonElement.classList.add('recording');
        buttonElement.innerText = 'Stop Recording';
        console.log("Recording started");
        currentStep = 0;
        sequence.notes = [];
    } else {
        buttonElement.classList.remove('recording');
        buttonElement.innerText = 'Start Recording';
        console.log("Recording stopped");
    }
}

function recordNote(noteName) {
    if (!isRecording) return;

    const pitch = noteToMidi(noteName);
    if (pitch === null) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime; // Time elapsed since the start of recording
    const beatsElapsed = (elapsedTime / 1000) / (60 / bpm); // Convert time to beats

    // Assuming each note is a quarter note, adjust as necessary
    const quantizedStartStep = Math.round(beatsElapsed * sequence.quantizationInfo.stepsPerQuarter);
    const quantizedEndStep = quantizedStartStep + sequence.quantizationInfo.stepsPerQuarter; 

    sequence.notes.push({
        pitch,
        quantizedStartStep,
        quantizedEndStep
    });

    sequence.totalQuantizedSteps = Math.max(sequence.totalQuantizedSteps, quantizedEndStep);
}
// This function might be called wherever a note is played
function handleNotePlayed(note) {
    recordNote(note);
}

function noteToMidi(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.slice(-1), 10);
    const keyNumber = notes.indexOf(note.slice(0, -1));

    if (keyNumber === -1) return null; // Invalid note name

    return 12 * (octave + 1) + keyNumber;
}
function exportMIDI() {
    console.log("Export MIDI called");
    if (!isRecording && sequence.notes.length > 0) {
        // Create a new MIDI file
        const midi = new Midi();

        // Add a track to the MIDI file
        const track = midi.addTrack();
        const secondsPerBeat = 60 / 120; // For BPM = 120
        const quantizedStepDuration = secondsPerBeat / 4; // Dividing by 4 because there are four 16th notes in a beat

        // Iterate over recorded notes and add them to the track
        sequence.notes.forEach(note => {
            // You might need to adjust the parameters here based on how your notes are recorded
            track.addNote({
                midi: note.pitch,
                time: note.quantizedStartStep * quantizedStepDuration, // Assuming 0.5 seconds per step, adjust as necessary
                duration: (note.quantizedEndStep - note.quantizedStartStep) * quantizedStepDuration // Adjust time unit as necessary
            });
        });

        // Convert MIDI to binary and create a Blob
        const midiBinary = midi.toArray();
        const blob = new Blob([midiBinary], { type: 'audio/midi' });

        // Create and click a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'recorded-music.midi';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.warn('No music recorded or recording is still in progress');
    }
}
export { exportMIDI, toggleRecording, initializeRecording, handleNotePlayed };
