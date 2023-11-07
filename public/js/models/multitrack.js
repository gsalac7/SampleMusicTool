import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

let music_vae;
let generatedSequence;
let numSequences = 1;
let player = "default";

function initializeMultiTrackModel(checkpoint) {
    instrumentConfig['currentModel'] = "MultiTrack";
    music_vae = new mm.MusicVAE(checkpoint);
    music_vae.initialize().then(function () {
        console.log('MultiTrack Model initialized');
        hideLoader();
        showNotification("MultiTrack MOdel initialized Successfully!");
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });

    if (checkpoint.includes('multi')) {
        player = "default"
    }
}

function disposeMultiTrackModel() {
    if (music_vae) {
        music_vae.dispose();
        instrumentConfig['currentModel'] = '';
    }
}
/*
async function generateMultiTrackSequence() {
    let temperature = instrumentConfig['temperature'];
    const chords = [
        document.getElementById('chordInput1').value,
        document.getElementById('chordInput2').value,
        document.getElementById('chordInput3').value,
        document.getElementById('chordInput4').value,
    ].filter(chord => chord !== ""); // Filter out empty chords
    console.log("Generating with chords: " + chords + " and temperature: " + temperature);

    // Ensure fullSequence is initialized with the correct properties for a quantized sequence
    let fullSequence = {
        notes: [],
        totalQuantizedSteps: 0 // This should be set to the length of the sequence in quantized steps
    };

    for (let chord of chords) {
        let sequences = await music_vae.sample(1, null, { chordProgression: [chord] }, 24);
        // Assuming sample() returns an array of sequences
        let sequence = sequences[0];
        console.log(sequence)

        sequence.notes.forEach(note => {
            note.quantizedStartStep += fullSequence.totalQuantizedSteps;
            note.quantizedEndStep += fullSequence.totalQuantizedSteps;
            fullSequence.notes.push(note);
        });

        // Increment the totalQuantizedSteps by the amount in the current sequence
        // Assuming that the length of each bar (sequence) is the same in terms of quantized steps
        fullSequence.totalQuantizedSteps += sequence.totalQuantizedSteps;
    }

    // Set the remaining parts of the Sequence object
    fullSequence.quantizationInfo = { stepsPerQuarter: 24 };
    fullSequence.tempos = [{ "qpm": 120 }];

    if (fullSequence) {
        generatedSequence = fullSequence; // Use the full, concatenated sequence
        if (player === "soundfont") {
            playGeneratedSequenceSoundFont(generatedSequence)
        } else {
            playGeneratedSequenceDefault(generatedSequence);
        }
        // Display replay-button and download link
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
    }
}
*/

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
    let generatedSequences = await music_vae.sample(1, temperature, { chordProgression: [chords[0]] }, 24);
    let generatedSequence = generatedSequences[0];
    console.log("Current generatedSequence")
    console.log(generatedSequence)

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
        console.log(chords[i])
        console.log("Transposition Interval for chord: " + transpositionInterval);

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
    if (player === "soundfont") {
        playGeneratedSequenceSoundFont(generatedSequence)
    } else {
        playGeneratedSequenceDefault(generatedSequence);
    }
    // Display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
}


function replayMultiTrackSequence() {
    if (player == "default") {
        playGeneratedSequenceDefault(generatedSequence[0])
    } else {
        playGeneratedSequenceSoundFont(generatedSequence[0], false) // should no longer be normalized
    }
}

async function exportMultiTrackSequence() {
    const midiBytes = mm.sequenceProtoToMidi(generatedSequence[0]);
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
