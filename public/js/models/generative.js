import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

// Define Markov chains for melody and harmony
const melodyChain = {
  72: { 72: 0.4, 74: 0.3, 76: 0.3 },
  74: { 72: 0.5, 76: 0.5 },
  76: { 72: 0.6, 74: 0.4 }
};

const harmonyChain = {
  60: { 60: 0.3, 64: 0.3, 67: 0.4 },
  64: { 60: 0.4, 67: 0.6 },
  67: { 60: 0.5, 64: 0.5 }
};

function initializeMarkovModel() {
    hideLoader();
    showNotification("Markov Chain initialized Successfully!");
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

// Function to generate a music sequence for a given Markov chain
function generateMusicSequence(startPitch, totalSteps, stepsPerQuarter, chain) {
  let currentStep = 0;
  let currentPitch = startPitch;
  const sequence = [];

  while (currentStep < totalSteps) {
    const nextPitch = chooseNextPitch(currentPitch, chain);
    // Ensure the note duration fits within a 4/4 measure
    const maxDuration = stepsPerQuarter * 4 - (currentStep % (stepsPerQuarter * 4));
    const duration = Math.floor(Math.random() * maxDuration + 1);
    const nextStep = currentStep + duration;

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

function playGenerativeSequence() {
    // Generate a new music sequence for melody and harmony
    const melodySequence = generateMusicSequence(72, 128, 4, melodyChain);
    const harmonySequence = generateMusicSequence(60, 128, 4, harmonyChain);

    // Combine melody and harmony sequences
    const combinedSequence = melodySequence.concat(harmonySequence);

    // Output the generated sequence in the required format
    const generatedMusic = {
    quantizationInfo: { stepsPerQuarter: 4 },
    notes: combinedSequence,
    totalQuantizedSteps: 128
    };

    playGeneratedSequenceDefault(generatedMusic);
}

export { initializeMarkovModel, generateMusicSequence, playGenerativeSequence }