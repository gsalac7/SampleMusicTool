import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, clearVisualizer, displayControls } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showError, showNotification, showSvgLoader, hideSvgLoader } from '../util/controlsManager';

let music_vae;
let generatedSequence;
const tf = mm.tf;

async function initializeMultiTrackModel(checkpoint) {
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
        showError("Failed to initialize model");
    }
}

function disposeMultiTrackModel() {
    if (music_vae) {
        clearVisualizer();
        music_vae.dispose();
        instrumentConfig['currentModel'] = '';
    }
}

async function generateMultiTrackSequence() {
    showSvgLoader();
    const temperature = instrumentConfig['temperature'];
    const numInterpolationSteps = 4;
    const Z_DIM = 256; 

    let fullSequence = {
        notes: [],
        totalQuantizedSteps: 0,
        quantizationInfo: { stepsPerQuarter: 24 },
        tempos: [{ qpm: 120 }]
    };

    // Sample two random latent vectors
    let z1 = tf.randomNormal([1, Z_DIM]);
    let z2 = tf.randomNormal([1, Z_DIM]);

    // Define a chord progression
    const chordProgression = [
        document.getElementById('chordInput1').value,
        document.getElementById('chordInput2').value,
        document.getElementById('chordInput3').value,
        document.getElementById('chordInput4').value
    ].filter(Boolean);;

    if (chordProgression.length === 0) {
        showError("Please enter at least one chord to generate a Melodic progression");
        hideSvgLoader();
        return 
    }

    for (let step = 0; step < numInterpolationSteps; step++) {
        let alpha = step / (numInterpolationSteps - 1);
        let interpolatedZ = slerp(z1, z2, alpha);

        // Select a chord from the progression based on the current step
        let chord = chordProgression[step % chordProgression.length];

        // Decode the interpolated latent vector to a sequence with the selected chord
        let decodedSeq = await music_vae.decode(interpolatedZ, temperature, { chordProgression: [chord] });
        let sequence = decodedSeq[0]; // Assuming decode returns an array of sequences

        // Process and add each note to fullSequence
        sequence.notes.forEach(note => {
            let offset = fullSequence.totalQuantizedSteps;
            let transposedNote = {
                ...note,
                quantizedStartStep: note.quantizedStartStep + offset,
                quantizedEndStep: note.quantizedEndStep + offset
            };
            fullSequence.notes.push(transposedNote);
        });

        fullSequence.totalQuantizedSteps += sequence.totalQuantizedSteps;
    }
    generatedSequence = JSON.parse(JSON.stringify(fullSequence));

    // Use the full, concatenated sequence for playback
    hideSvgLoader();
    playGeneratedSequenceSoundFont(fullSequence);
    displayControls();
}

function slerp(z1, z2, alpha) {
    const z1Norm = tf.norm(z1);
    const z2Norm = tf.norm(z2);

    const omega = tf.acos(tf.sum(tf.mul(tf.div(z1, z1Norm), tf.div(z2, z2Norm))));
    const sinOmega = tf.sin(omega);

    const z1Scaled = tf.mul(tf.sin(tf.mul(1 - alpha, omega)), tf.div(z1, sinOmega));
    const z2Scaled = tf.mul(tf.sin(tf.mul(alpha, omega)), tf.div(z2, sinOmega));

    return tf.add(z1Scaled, z2Scaled);
}

function replayMultiTrackSequence() {
    let sequence = JSON.parse(JSON.stringify(generatedSequence));
    playGeneratedSequenceSoundFont(sequence, true) 
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
