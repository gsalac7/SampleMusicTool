import { playNote } from './synthManager'; // Adjust the path as needed

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
    playNote(note);
    recordNote(note);
}

export { initializeRecording, handleNotePlayed };
