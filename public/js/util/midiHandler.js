import { playNote } from './synthManager'; 
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
    console.log("MIDI Access Object", midiAccess);

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
    console.log("MIDI Message received", event);

    let midiNote = event.data[1];
    let velocity = event.data[2];
    
    // Determine the action based on the MIDI event received
    if (event.data[0] === 144 && velocity > 0) { // Note on event
        // Convert the midiNote to its corresponding note string
        // and play it (you may need to adjust this conversion)
        let noteString = convertMidiNoteToString(midiNote);
        playNote(noteString);
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
