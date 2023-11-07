import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

// Define Markov chains for melody and harmony
const melodyChain = {
    72: { 72: 0.2, 74: 0.2, 76: 0.2, 77: 0.2, 79: 0.1, 81: 0.1 },
    74: { 72: 0.1, 74: 0.2, 76: 0.3, 77: 0.2, 79: 0.1, 81: 0.1 },
    76: { 72: 0.1, 74: 0.2, 76: 0.2, 77: 0.2, 79: 0.2, 81: 0.1 },
    77: { 72: 0.1, 74: 0.1, 76: 0.3, 77: 0.2, 79: 0.2, 81: 0.1 },
    79: { 72: 0.1, 74: 0.1, 76: 0.2, 77: 0.3, 79: 0.2, 81: 0.1 },
    81: { 72: 0.1, 74: 0.1, 76: 0.1, 77: 0.2, 79: 0.3, 81: 0.2 }
};

const harmonyChain = {
    60: { 60: 0.25, 64: 0.25, 67: 0.25, 69: 0.15, 71: 0.10 },
    64: { 60: 0.20, 64: 0.30, 67: 0.30, 69: 0.10, 71: 0.10 },
    67: { 60: 0.25, 64: 0.25, 67: 0.20, 69: 0.15, 71: 0.15 },
    69: { 60: 0.15, 64: 0.20, 67: 0.35, 69: 0.20, 71: 0.10 },
    71: { 60: 0.10, 64: 0.15, 67: 0.25, 69: 0.25, 71: 0.25 }
};

let generatedSequence;

function initializeMarkovModel() {
    hideLoader();
    showNotification("Markov Chain initialized Successfully!");
}

// Function to generate a music sequence for a given Markov chain
function generateMusicSequence(startPitch, totalSteps, stepsPerQuarter, chain) {
    let currentStep = 0;
    let currentPitch = startPitch;
    const sequence = [];
    const noteLengths = [1, 2, 4, 8]; // Possible note lengths as fractions of a quarter note
    const restProbability = 0.15; // 15% chance of a rest

    while (currentStep < totalSteps) {
        // Decide whether to add a rest or a note
        if (Math.random() < restProbability) {
            // Add a rest
            const restLength = noteLengths[Math.floor(Math.random() * noteLengths.length)];
            const restDuration = stepsPerQuarter / restLength;
            currentStep += restDuration; // Skip ahead by the rest duration
        } else {
            // Add a note
            const nextPitch = chooseNextPitch(currentPitch, chain);
            const noteLength = noteLengths[Math.floor(Math.random() * noteLengths.length)];
            const duration = stepsPerQuarter / noteLength; // Duration based on the selected note length
            let nextStep = currentStep + duration;

            // Adjust nextStep to not exceed the totalSteps
            if (nextStep > totalSteps) {
                nextStep = totalSteps;
            }

            sequence.push({
                pitch: nextPitch,
                quantizedStartStep: currentStep,
                quantizedEndStep: nextStep
            });

            currentPitch = nextPitch; // Update the current pitch for the next iteration
            currentStep = nextStep; // Move to the next step
        }
    }

    return sequence;
}


function playGenerativeSequence() {
    // Generate a new music sequence for melody and harmony
    const melodySequence = generateMusicSequence(72, 128, 4, melodyChain);
    let harmonySequence;
    //const harmonySequence = generateMusicSequence(60, 128, 4, harmonyChain);

    if (harmonySequence) {
        // Combine melody and harmony sequences
        generatedSequence = {
            quantizationInfo: { stepsPerQuarter: 4 },
            notes: melodySequence.concat(harmonySequence),
            totalQuantizedSteps: 128
        };
    }
    else {
        // Combine melody and harmony sequences
        generatedSequence = {
            quantizationInfo: { stepsPerQuarter: 4 },
            notes: melodySequence,
            totalQuantizedSteps: 128
        };
        
    }

    // Assuming playGeneratedSequenceDefault and playGeneratedSequenceSoundFont are defined elsewhere
    // playGeneratedSequenceDefault(generatedSequence);
    playGeneratedSequenceSoundFont(generatedSequence, false); // should no longer be normalized
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
    if (player == "default") {
        playGeneratedSequenceDefault(generatedSequence)
    } else {
        playGeneratedSequenceSoundFont(generatedSequence, false) // should no longer be normalized
    }
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

export { initializeMarkovModel, generateMusicSequence, playGenerativeSequence, replayGenerativeSequence, exportGenerativeSequence}