import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { clearVisualizer, playGeneratedSequenceSoundFont, displayControls } from './visualizer';
import { hideLoader, showError, showNotification, hideSvgLoader, showSvgLoader } from '../util/controlsManager';

let rnnModel;
let generatedSequence;

let STEPS_PER_CHORD = 8;
let STEPS_PER_PROG = 4 * STEPS_PER_CHORD;

// Number of times to repeat chord progression.
let NUM_REPS = 4;

async function initializeChordModel(checkpoint) {
    instrumentConfig['currentModel'] = "chordImprov";
    rnnModel = new mm.MusicRNN(checkpoint);
    try {
        await rnnModel.initialize();
        console.log('Model initialized');
        hideLoader();
        showNotification("Chord Model Initialized");
        document.getElementById('generateMusic').style.display = 'inline-block';
    } catch (error) {
        console.error('Failed to initialize model:', error);
        showError("Failed to initialize model");

    }
}

async function generateChordSequence() {
  showSvgLoader();
  const chords = [
    document.getElementById('chordInput1').value,
    document.getElementById('chordInput2').value,
    document.getElementById('chordInput3').value,
    document.getElementById('chordInput4').value
  ].filter(Boolean);;

  if (chords.length === 0) {
    showError("Please enter at least one chord to generate a Melodic progression");
    hideSvgLoader();
    return;
  }

  const steps = instrumentConfig['stepsPerQuarter']; 

  if (!steps) {
    showError("Please select the number of steps per quarter note in the dropdown");
    hideSvgLoader();
    return;
  }

  const temperature = instrumentConfig['temperature']; // Replace with your specific temperature
  const length = STEPS_PER_PROG + (NUM_REPS - 1) * STEPS_PER_PROG - 1;

  // Prime with root note of the first chord.
  const root = mm.chords.ChordSymbols.root(chords[0]);
  // Create initial sequence
  const initialSeq = {
    quantizationInfo: { stepsPerQuarter: steps },
    notes: [],
    totalQuantizedSteps: 1
  };

  const genSequence = await rnnModel.continueSequence(initialSeq, length, temperature, chords);

  // Add the continuation to the original sequence
  genSequence.notes.forEach((note) => {
    note.quantizedStartStep += 1;
    note.quantizedEndStep += 1;
    initialSeq.notes.push(note);
  });

  const roots = chords.map(mm.chords.ChordSymbols.root);

  // Determine the steps for each chord based on how many chords there are
  const stepsPerChord = STEPS_PER_PROG / roots.length;

  // Add the bass progression
  for (let i = 0; i < NUM_REPS; i++) {
    for (let j = 0; j < roots.length; j++) {
      // Calculate the start and end steps for each bass note
      const startStep = i * STEPS_PER_PROG + j * stepsPerChord;
      const endStep = startStep + stepsPerChord;

      // Add the bass note for the current chord
      initialSeq.notes.push({
        pitch: 36 + roots[j], // Add the correct bass note for the chord
        quantizedStartStep: startStep,
        quantizedEndStep: endStep
      });
    }
  }

  // Set total sequence length
  initialSeq.totalQuantizedSteps = STEPS_PER_PROG * NUM_REPS;
  generatedSequence = initialSeq;

  if (generatedSequence) {
    //playGeneratedSequenceDefault(initialSeq);
    hideSvgLoader();
    playGeneratedSequenceSoundFont(generatedSequence, true);

    // Display replay-button and download link
    displayControls();
  }
}

async function exportChordSequence() {
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

function replayChordSequence() {
  playGeneratedSequenceSoundFont(generatedSequence, false);
}

function disposeChordModel() {
  if (rnnModel) {
    clearVisualizer();
    console.log("Disposing Chord RNN Model");
    rnnModel.dispose();
    instrumentConfig['currentModel'] = ''
    generatedSequence = null;
  }
}

export { generateChordSequence, initializeChordModel, disposeChordModel, exportChordSequence, replayChordSequence };