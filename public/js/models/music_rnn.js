import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';
import { playGeneratedSequenceSoundFont } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

let rnnModel;
let generatedSequence;
let seedSequence;

// initialize the AI Model
function initializeRNNModel(checkpoint) {
    instrumentConfig['currentModel'] = "MusicRNN";
    rnnModel = new mm.MusicRNN(checkpoint);
    rnnModel.initialize().then(function () {
        console.log('Model initialized');
        hideLoader();
        showNotification("MusicRNN Model Initialized");
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });
}

// Generate sequence specific for RNN model
async function generateMusicRNNSequence() {
    let length = instrumentConfig['length']; 
    let steps = instrumentConfig['stepsPerQuarter']; 
    let temperature = instrumentConfig['temperature'];
    seedSequence = seedSequences['majorScaleUp'];
    // Normalize the Tempo
    seedSequence.tempos.forEach((tempo) => {
        tempo.qpm = 120; // Set to your desired tempo
    });


    console.log("Generated sequence with Temperature: " + temperature + " and Length: " + length + " and Steps: " + steps);

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

function readMidi(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const midi = new Uint8Array(event.target.result);
            // Convert MIDI to NoteSequence
            const noteSequence = await mm.midiToSequenceProto(midi);
            // Use noteSequence as your seed
            seedSequence = noteSequence;
        };
        reader.readAsArrayBuffer(file);
    }
}
function disposeRNNModel() {
    if (rnnModel) {
        rnnModel.dispose();
        instrumentConfig['currentModel'] = '';
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
    readMidi,
    exportMusicRNNSequence,
    replayMusicRNNSequence
};
