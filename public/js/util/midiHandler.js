import { startNote, stopNote } from './synthManager'; 

// Initializing the MIDI
function initializeMidi() {
    // Check for WebMIDI support
    if (!navigator.requestMIDIAccess) {
        console.warn("WebMIDI is not supported in this browser.");
        return;
    }
    // Request MIDI access
    navigator.requestMIDIAccess({ sysex: false })
        .then(onMIDISuccess, onMIDIFailure);
}

// Function to be called when MIDI access is successfully obtained
function onMIDISuccess(midiAccess) {
    console.log("Midi Success")
    // Get inputs
    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // Each input port
        input.value.onmidimessage = onMIDIMessage;
    }
}

// Function to be called when MIDI access is failed
function onMIDIFailure(err) {
    console.warn("Failed to get MIDI access - ", err);
}

// Handling MIDI Messages
function onMIDIMessage(event) {
    let midiNote = event.data[1];
    let velocity = event.data[2] / 127; // Normalize to [0, 1]

    let noteString = convertMidiNoteToString(midiNote);

    if (event.data[0] >= 144 && event.data[0] <= 159 && velocity > 0) { // Note On with non-zero velocity
        startNote(noteString, velocity);
    } else if (event.data[0] >= 128 && event.data[0] <= 143 || (event.data[0] >= 144 && event.data[0] <= 159 && velocity === 0)) { // Note Off or Note On with zero velocity
        stopNote(noteString);
    }
}

// Helper function to convert a MIDI note to a string representation
// Adjust this function as needed for your application
function convertMidiNoteToString(midiNote) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = (midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return notes[noteIndex] + Math.floor(octave);
}

export { initializeMidi };
