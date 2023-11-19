import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';
import { playGeneratedSequenceSoundFont, clearVisualizer, displayControls } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, hideSvgLoader, showError, showNotification, showSvgLoader } from '../util/controlsManager';

let rnnModel;
let generatedSequence;
let seedSequence;

// initialize the AI Model
async function initializeRNNModel(checkpoint) {
    instrumentConfig['currentModel'] = "MusicRNN";
    rnnModel = new mm.MusicRNN(checkpoint);

    try {
        await rnnModel.initialize();
        console.log('Model initialized');
        hideLoader();
        showNotification("MusicRNN Model Initialized");
        document.getElementById('generateMusic').style.display = 'inline-block';
    } catch (error) {
        console.error('Failed to initialize model:', error);
        showError("Failed to initialize model");
    }
}

// Generate sequence specific for RNN model
async function generateMusicRNNSequence() {
    showSvgLoader();
    let length = instrumentConfig['length']; 
    if (!length) {
        showError("Please select the length of the sequence in the dropdown");
        hideSvgLoader();
        return;
    }
    let steps = instrumentConfig['stepsPerQuarter']; 
    if (!steps) {
        showError("Please select the number of steps per quarter note in the dropdown");
        hideSvgLoader();
        return;
    }
    let temperature = instrumentConfig['temperature'];
    // If no seed Sequence is present default to what is in the dropdown
    if (!seedSequence) {
        seedSequence = seedSequences['majorScaleUp'];
    }
    // Normalize the Tempo
    seedSequence.tempos.forEach((tempo) => {
        tempo.qpm = 120; // Set to your desired tempo
    });

    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, steps);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, length, temperature);
    if (generatedSequence) {
        hideSvgLoader();
        playGeneratedSequenceSoundFont(generatedSequence, false);
        // display replay-button and download link
        displayControls();
    }
}

function replayMusicRNNSequence() {
    playGeneratedSequenceSoundFont(generatedSequence, false);
}

function readSeedMidi(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const midi = new Uint8Array(event.target.result);
            // Convert MIDI to NoteSequence
            const noteSequence = await mm.midiToSequenceProto(midi);
            // Use noteSequence as your seed
            seedSequence = noteSequence;
            console.log("Setting this as seedSequence: " + seedSequence)
        };
        reader.readAsArrayBuffer(file);
    }
}
function disposeRNNModel() {
    if (rnnModel) {
        clearVisualizer();
        rnnModel.dispose();
        instrumentConfig['currentModel'] = '';
        generatedSequence = null;
    }
}

function setSeedSequence(newSeedSequence) {
    seedSequence = seedSequences[newSeedSequence];
}

async function exportMusicRNNSequence() {
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

export {
    disposeRNNModel,
    initializeRNNModel,
    generateMusicRNNSequence,
    setSeedSequence,
    readSeedMidi,
    exportMusicRNNSequence,
    replayMusicRNNSequence
};
