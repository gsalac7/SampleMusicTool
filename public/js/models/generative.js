import { playGeneratedSequenceSoundFont, clearVisualizer } from './visualizer';
import { hideLoader, showNotification } from '../util/controlsManager';
import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';

const melodyChain = {
    69: { 69: 0.3, 71: 0.25, 72: 0.25, 74: 0.15, 76: 0.05 }, // A
    71: { 69: 0.2, 71: 0.3, 72: 0.25, 74: 0.15, 76: 0.1 }, // B
    72: { 71: 0.15, 72: 0.4, 74: 0.25, 76: 0.15, 77: 0.05 }, // C
    73: { 72: 0.3, 73: 0.4, 74: 0.2, 76: 0.1 }, // C# (chromatic passing tone)
    74: { 72: 0.2, 73: 0.1, 74: 0.4, 76: 0.2, 77: 0.1 }, // D
    75: { 74: 0.3, 75: 0.4, 76: 0.2, 77: 0.1 }, // Eb (chromatic passing tone)
    76: { 74: 0.15, 75: 0.05, 76: 0.4, 77: 0.25, 79: 0.15 }, // E
    77: { 76: 0.2, 77: 0.4, 79: 0.3, 71: 0.1 }, // F
    79: { 77: 0.25, 79: 0.4, 71: 0.2, 72: 0.15 }  // G
};


let generatedSequence;

function initializeMarkovModel() {
    clearVisualizer();
    hideLoader();
    showNotification("Markov Chain initialized Successfully!");
    document.getElementById('replay-button').style.display = 'none';
    document.getElementById('download-link').style.display = 'none';
    document.getElementById('generateMusic').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'none';
}

function disposeMarkovModel() {
    clearVisualizer();
    instrumentConfig['currentModel'] = '';
    document.getElementById('replay-button').style.display = 'none';
    document.getElementById('download-link').style.display = 'none';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('loop-button').style.display = 'none';
}

function generateMusicSequence(startPitch, totalSteps, stepsPerQuarter, chain) {
    let currentStep = 0;
    let currentPitch = startPitch;
    const sequence = [];
    const noteLengths = [1, 2, 4]; // Including 16th, 8th, and quarter notes
    const restProbability = 0.05; // Reduced chance of a rest
    const rootNote = startPitch; // Assuming the startPitch is the root note

    while (currentStep < totalSteps) {
        if (Math.random() < restProbability) {
            currentStep += stepsPerQuarter / noteLengths[Math.floor(Math.random() * noteLengths.length)];
        } else {
            let nextPitch;
            const noteLengthIndex = Math.random() < 0.5 ? 2 : (Math.random() < 0.75 ? 1 : 0);
            const duration = stepsPerQuarter / noteLengths[noteLengthIndex];
            let nextStep = currentStep + duration;

            // Check if this is the last note in the sequence
            if (nextStep >= totalSteps) {
                nextStep = totalSteps;
                nextPitch = rootNote; // Set the last note to the root note
            } else {
                nextPitch = chooseNextPitch(currentPitch, chain);
            }

            sequence.push({
                pitch: nextPitch,
                quantizedStartStep: currentStep,
                quantizedEndStep: nextStep,
                velocity: currentStep % stepsPerQuarter === 0 ? 100 : 70
            });

            currentPitch = nextPitch;
            currentStep = nextStep;
        }
    }

    return sequence;
}


function playGenerativeSequence() {
    // Generate a new music sequence for melody and harmony
    const melodySequence = generateMusicSequence(72, 64, 4, melodyChain);
    // Combine melody and harmony sequences
    generatedSequence = {
        quantizationInfo: { stepsPerQuarter: 4 },
        notes: melodySequence,
        totalQuantizedSteps: 64
    };

    // Assuming playGeneratedSequenceDefault and playGeneratedSequenceSoundFont are defined elsewhere
    // playGeneratedSequenceDefault(generatedSequence);
    playGeneratedSequenceSoundFont(generatedSequence, false); // should no longer be normalized
    // display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
    document.getElementById('loop-button').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'inline-block';
}

// Function to choose the next pitch based on the current pitch and a Markov chain
function chooseNextPitch(currentPitch, chain) {
    const probabilities = chain[currentPitch];
    const rand = Math.random();
    let cumulative = 0;

    for (let [pitch, probability] of Object.entries(probabilities)) {
        cumulative += probability;
        if (rand <= cumulative) {
            return parseInt(pitch);
        }
    }

    return currentPitch; // Fallback to the current pitch if none is chosen
}

function replayGenerativeSequence() {
    playGeneratedSequenceSoundFont(generatedSequence, false) // should no longer be normalized
}

async function exportGenerativeSequence() {
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

export { initializeMarkovModel, disposeMarkovModel, generateMusicSequence, playGenerativeSequence, replayGenerativeSequence, exportGenerativeSequence }