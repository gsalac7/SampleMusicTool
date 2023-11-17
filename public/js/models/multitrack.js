import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, clearVisualizer } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

let music_vae;
let generatedSequence;

async function initializeMultiTrackModel(checkpoint) {
    clearVisualizer();
    instrumentConfig['currentModel'] = "MultiTrack";
    music_vae = new mm.MusicVAE(checkpoint);

    try {
        await music_vae.initialize();
        console.log('MultiTrack Model initialized');
        hideLoader();
        showNotification("MultiTrack Model initialized Successfully!");
        document.getElementById('generateMusic').style.display = 'inline-block';
    } catch (error) {
        console.error('Failed to initialize model:', error);
        // Handle the error appropriately, such as showing an error message to the user
    }
}

function disposeMultiTrackModel() {
    if (music_vae) {
        music_vae.dispose();
        instrumentConfig['currentModel'] = '';
        document.getElementById('replay-button').style.display = 'none';
        document.getElementById('download-link').style.display = 'none';
        document.getElementById('stop-button').style.display = 'none';
    }
}

function getRootNoteForChord(chord) {
    // This maps chord names to MIDI root notes
    const chordToNoteMap = {
        'C': 60,  // Middle C
        'C#': 61, // C# Major
        'D': 62,  // D Major
        'D#': 63, // D# Major
        'E': 64,  // E Major
        'F': 65,  // F Major
        'F#': 66, // F# Major
        'G': 67,  // G Major
        'G#': 68, // G# Major
        'A': 69,  // A Major
        'A#': 70, // A# Major
        'B': 71,  // B Major
        'Cm': 60, // C Minor
        'C#m': 61, // C# Minor
        'Dm': 62,  // D Minor
        'D#m': 63, // D# Minor
        'Em': 64,  // E Minor
        'Fm': 65,  // F Minor
        'F#m': 66, // F# Minor
        'Gm': 67,  // G Minor
        'G#m': 68, // G# Minor
        'Am': 69,  // A Minor
        'A#m': 70, // A# Minor
        'Bm': 71   // B Minor
        // You can continue adding other chords and their variations, including 7ths, diminished, augmented, etc.
    };

    // Extract the root note and the quality of the chord (major, minor, etc.)
    // If the chord contains more than one character (e.g., "C#m"),
    // we separate the root note (e.g., "C#") and the chord quality (e.g., "m").
    let root = chord;
    let quality = '';

    if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) {
        root = chord.substring(0, 2);
        quality = chord.substring(2);
    } else if (chord.length > 1) {
        root = chord.substring(0, 1);
        quality = chord.substring(1);
    }

    // Combine root and quality to form the chord key for the map
    let chordKey = `${root}${quality}`;

    // Return the MIDI note number, or a default value (Middle C) if the chord is not found
    return chordToNoteMap[chordKey] || 60;
}

async function generateMultiTrackSequence() {
    let temperature = instrumentConfig['temperature'];
    const chords = [
        document.getElementById('chordInput1').value,
        document.getElementById('chordInput2').value,
        document.getElementById('chordInput3').value,
        document.getElementById('chordInput4').value,
    ].filter(chord => chord !== ""); // Filter out empty chords

    // Generate the initial sequence based on the first chord
    let generatedSeq = await music_vae.sample(1, temperature, { chordProgression: [chords[0]] }, 24);
    generatedSequence = generatedSeq[0];

    // Ensure fullSequence is initialized with the correct properties for a quantized sequence
    let fullSequence = {
        notes: [],
        totalQuantizedSteps: 0,
        quantizationInfo: { stepsPerQuarter: 24 },
        tempos: [{ qpm: 120 }]
    };

    // Get the MIDI note number for the first chord
    let rootNote = getRootNoteForChord(chords[0]);

    for (let i = 0; i < chords.length; i++) {
        // Transpose the sequence if necessary
        let transpositionInterval = getRootNoteForChord(chords[i]) - rootNote;

        generatedSequence.notes.forEach(note => {
            // Copy and transpose the note
            let transposedNote = {
                ...note,
                pitch: note.isDrum ? note.pitch : note.pitch + transpositionInterval,
                quantizedStartStep: note.quantizedStartStep + i * generatedSequence.totalQuantizedSteps,
                quantizedEndStep: note.quantizedEndStep + i * generatedSequence.totalQuantizedSteps
            };

            // Make sure the transposed pitch is within the MIDI range (for non-drum notes)
            if (note.isDrum || (transposedNote.pitch >= 0 && transposedNote.pitch <= 127)) {
                fullSequence.notes.push(transposedNote);
            }
        });

        // Assuming each sequence/bar has the same number of quantized steps
        fullSequence.totalQuantizedSteps += generatedSequence.totalQuantizedSteps;
    }

    // Use the full, concatenated sequence for playback
    generatedSequence = fullSequence;
    playGeneratedSequenceSoundFont(generatedSequence)
    // Display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'inline-block';
}

function replayMultiTrackSequence() {
    playGeneratedSequenceSoundFont(generatedSequence, false) // should no longer be normalized
}

async function exportMultiTrackSequence() {
    const midiBytes = mm.sequenceProtoToMidi(generatedSequence);
    const midiBlob = new Blob([new Uint8Array(midiBytes)], { type: 'audio/midi' });

    // Create a download link and append it to the document
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(midiBlob);
    downloadLink.download = 'generated-music.mid';
    document.body.appendChild(downloadLink);

    // Programmatically click the download link to trigger the download, then remove the link
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export { exportMultiTrackSequence, generateMultiTrackSequence, initializeMultiTrackModel, disposeMultiTrackModel, replayMultiTrackSequence }
