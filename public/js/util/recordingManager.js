import { playNote } from './synthManager'; // Adjust the path as needed
import { Midi } from '@tonejs/midi'

let isRecording = false;
let sequence = {
    notes: [],
    totalQuantizedSteps: 0,
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 60 }],
    timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
};
let currentStep = 0;

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

// Record a note
function recordNote(note) {
    console.log("Record Note: " + note);
    if (!isRecording) return;

    const pitch = note; // Adjust this if needed based on how your note is represented
    sequence.notes.push({
        pitch,
        quantizedStartStep: currentStep,
        quantizedEndStep: currentStep + 4 // Modify as needed
    });

    // Increment current step
    currentStep += 4; // Update based on your requirements
    sequence.totalQuantizedSteps = Math.max(sequence.totalQuantizedSteps, currentStep);
    console.log("Note Sequence:", JSON.stringify(sequence));
}

// This function might be called wherever a note is played
function handleNotePlayed(note) {
    recordNote(note);
}

function exportMIDI() {
    console.log("Export MIDI called");
    if (!isRecording && sequence.notes.length > 0) {
        // Create a new MIDI file
        const midi = new Midi();

        // Add a track to the MIDI file
        const track = midi.addTrack();

        // Iterate over recorded notes and add them to the track
        sequence.notes.forEach(note => {
            // You might need to adjust the parameters here based on how your notes are recorded
            track.addNote({
                midi: note.pitch,
                time: note.quantizedStartStep * 0.5, // Assuming 0.5 seconds per step, adjust as necessary
                duration: (note.quantizedEndStep - note.quantizedStartStep) * 0.5 // Adjust time unit as necessary
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
