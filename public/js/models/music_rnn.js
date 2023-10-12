import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';
import { playGeneratedSequence } from './visualizer';

//const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
//const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
//const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');

let rnnModel;
let temperature = 1.0;
let seedSequence = seedSequences['majorScaleUp'];
let generatedSequence;
let length = 50; // set default length to 50
let steps = 4; // set default steps to 4steps

// initialize the AI Model
function initializeRNNModel(checkpoint) {
  console.log("Checkpoint: " + checkpoint);
    rnnModel = new mm.MusicRNN();
    rnnModel.initialize().then(function () {
        console.log('Model initialized');
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });
}

// Generate sequence specific for RNN model
async function generateMusicRNNSequence() {
    console.log("Generating Music RNN Sequence");
    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, steps);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, length, temperature);
    console.log("Model musicRNN Sequence: " + JSON.stringify(generatedSequence));
    if (generatedSequence) {
        playGeneratedSequence(generatedSequence);
        // display replay-button and download link
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
    }
}

function replaySequence() {
    playGeneratedSequence(generatedSequence);
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
    }
}

function setSeedSequence(newSeedSequence) {
    seedSequence = seedSequences[newSeedSequence];
}

function setTemperature(newTemperature) {
    temperature = newTemperature;
}

function setLength(newLength) {
    length = parseInt(newLength, 10);
}

function setSteps(newSteps) {
    steps = parseInt(newSteps, 10);
}

async function exportSequence() {
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
    setLength,
    setSteps,
    initializeRNNModel,
    generateMusicRNNSequence,
    setTemperature,
    setSeedSequence,
    readMidi,
    exportSequence,
    replaySequence
};
