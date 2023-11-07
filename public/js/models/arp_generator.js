import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

// Define Markov chains for melody and harmony

// Define Markov chains for arpeggiated sequences
const arpeggioChain = {
    // C major chord notes
    60: { 64: 0.3, 67: 0.3, 72: 0.4 }, // C4 -> E4, G4, C5
    64: { 60: 0.3, 67: 0.3, 72: 0.4 }, // E4 -> C4, G4, C5
    67: { 60: 0.3, 64: 0.3, 72: 0.4 }, // G4 -> C4, E4, C5
    // F major chord notes
    65: { 69: 0.3, 72: 0.3, 76: 0.4 }, // F4 -> A4, C5, F5
    69: { 65: 0.3, 72: 0.3, 76: 0.4 }, // A4 -> F4, C5, F5
    // G major chord notes
    67: { 71: 0.3, 74: 0.3, 79: 0.4 }, // G4 -> B4, D5, G5
    71: { 67: 0.3, 74: 0.3, 79: 0.4 }, // B4 -> G4, D5, G5
    // A minor chord notes
    69: { 72: 0.3, 76: 0.3, 81: 0.4 }, // A4 -> C5, E5, A5
    72: { 69: 0.3, 76: 0.3, 81: 0.4 }, // C5 -> A4, E5, A5
};

// Function to generate a poppy arpeggiated sequence
function generateArpeggioSequence(startPitch, totalSteps, stepsPerQuarter, chain) {
    let currentStep = 0;
    let currentPitch = startPitch;
    const sequence = [];
    const noteLength = stepsPerQuarter; // Assuming each note is a quarter note for a steady arpeggio

    while (currentStep < totalSteps) {
        const nextPitch = chooseNextPitch(currentPitch, chain);
        const nextStep = currentStep + noteLength;

        sequence.push({
            pitch: nextPitch,
            quantizedStartStep: currentStep,
            quantizedEndStep: nextStep
        });

        currentStep = nextStep;
        currentPitch = nextPitch;
    }

    return sequence;
}

// Helper function to choose the next pitch based on the current pitch and a Markov chain
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


let generatedSequence;

function initializeMarkovModel() {
    hideLoader();
    showNotification("Markov Chain initialized Successfully!");
}


function playGenerativeSequence() {
    // Generate a new music sequence for melody and harmony
    const melodySequence = generateArpeggioSequence(72, 128, 4, melodyChain);
    //const harmonySequence = generateMusicSequence(60, 128, 4, harmonyChain);

    generatedSequence = {
        quantizationInfo: { stepsPerQuarter: 4 },
        notes: melodySequence,
        totalQuantizedSteps: 128
    };

    // Assuming playGeneratedSequenceDefault and playGeneratedSequenceSoundFont are defined elsewhere
    // playGeneratedSequenceDefault(generatedSequence);
    playGeneratedSequenceSoundFont(generatedSequence, false); // should no longer be normalized
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