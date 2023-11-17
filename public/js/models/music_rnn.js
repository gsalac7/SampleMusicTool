import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';
import { playGeneratedSequenceSoundFont, clearVisualizer } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

let rnnModel;
let generatedSequence;
let seedSequence;

// initialize the AI Model
async function initializeRNNModel(checkpoint) {
    clearVisualizer();
    instrumentConfig['currentModel'] = "MusicRNN";
    rnnModel = new mm.MusicRNN(checkpoint);

    try {
        await rnnModel.initialize();
        console.log('Model initialized');
        hideLoader();
        showNotification("MusicRNN Model Initialized");
    } catch (error) {
        console.error('Failed to initialize model:', error);
        // Handle the error appropriately
        // For example, show an error notification to the user
    }
}


// Generate sequence specific for RNN model
async function generateMusicRNNSequence() {
    let length = instrumentConfig['length']; 
    let steps = instrumentConfig['stepsPerQuarter']; 
    let temperature = instrumentConfig['temperature'];
    // Normalize the Tempo
    seedSequence.tempos.forEach((tempo) => {
        tempo.qpm = 120; // Set to your desired tempo
    });


    console.log("Seed Sequence; " + JSON.stringify(seedSequence, null, 2));

    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, steps);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, length, temperature);
    console.log("Model musicRNN Sequence: " + JSON.stringify(generatedSequence));
    if (generatedSequence) {
        playGeneratedSequenceSoundFont(generatedSequence, false);
        // display replay-button and download link
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
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
        rnnModel.dispose();
        instrumentConfig['currentModel'] = '';
        generatedSequence = null;
        document.getElementById('replay-button').style.display = 'none';
        document.getElementById('download-link').style.display = 'none';
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
