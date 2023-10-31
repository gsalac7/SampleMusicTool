import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { playGeneratedSequenceDefault, playGeneratedSequenceSoundFont } from './visualizer';

let rnnModel;
let generatedSequence;
let currentChords = undefined;

let STEPS_PER_CHORD = 8;
let STEPS_PER_PROG = 4 * STEPS_PER_CHORD;

// Number of times to repeat chord progression.
let NUM_REPS = 4;

// initialize the AI Model with chord improv
function initializeChordModel(checkpoint) {
  instrumentConfig['currentModel'] = "chordImprov";
  rnnModel = new mm.MusicRNN(checkpoint);
  rnnModel.initialize().then(function () {
    console.log('Model initialized');
  }).catch(function (error) {
    console.error('Failed to initialize model:', error);
  });
}

async function generateChordSequence() {
  const chords = [
    document.getElementById('chordInput1').value,
    document.getElementById('chordInput2').value,
    document.getElementById('chordInput3').value,
    document.getElementById('chordInput4').value
  ];
  const steps = 4; // Replace with your specific steps per quarter
  const temperature = 0.9; // Replace with your specific temperature
  const length = STEPS_PER_PROG + (NUM_REPS - 1) * STEPS_PER_PROG - 1;

  // Prime with root note of the first chord.
  const root = mm.chords.ChordSymbols.root(chords[0]);
  // Create initial sequence
  const initialSeq = {
    quantizationInfo: { stepsPerQuarter: steps },
    notes: [],
    totalQuantizedSteps: 1
  };

  console.log("CurrentChords: " + chords);

  console.log("Generated sequence with Temperature: " + temperature + " and Length: " + length + " and Steps: " + steps);

  const generatedSequence = await rnnModel.continueSequence(initialSeq, length, temperature, chords);

  // Add the continuation to the original sequence
  generatedSequence.notes.forEach((note) => {
    note.quantizedStartStep += 1;
    note.quantizedEndStep += 1;
    initialSeq.notes.push(note);
  });

  const roots = chords.map(mm.chords.ChordSymbols.root);
  // Add additional logic here (e.g., bass progression)
  for (var i = 0; i < NUM_REPS; i++) {
    // Add the bass progression.
    initialSeq.notes.push({
      instrument: 1,
      program: 32,
      pitch: 36 + roots[0],
      quantizedStartStep: i * STEPS_PER_PROG,
      quantizedEndStep: i * STEPS_PER_PROG + STEPS_PER_CHORD
    });
    initialSeq.notes.push({
      instrument: 1,
      program: 32,
      pitch: 36 + roots[1],
      quantizedStartStep: i * STEPS_PER_PROG + STEPS_PER_CHORD,
      quantizedEndStep: i * STEPS_PER_PROG + 2 * STEPS_PER_CHORD
    });
    initialSeq.notes.push({
      instrument: 1,
      program: 32,
      pitch: 36 + roots[2],
      quantizedStartStep: i * STEPS_PER_PROG + 2 * STEPS_PER_CHORD,
      quantizedEndStep: i * STEPS_PER_PROG + 3 * STEPS_PER_CHORD
    });
    initialSeq.notes.push({
      instrument: 1,
      program: 32,
      pitch: 36 + roots[3],
      quantizedStartStep: i * STEPS_PER_PROG + 3 * STEPS_PER_CHORD,
      quantizedEndStep: i * STEPS_PER_PROG + 4 * STEPS_PER_CHORD
    });
  }

  // Set total sequence length
  initialSeq.totalQuantizedSteps = STEPS_PER_PROG * NUM_REPS;


  if (initialSeq) {
    playGeneratedSequenceDefault(initialSeq);
    //playGeneratedSequenceSoundFont(initialSeq, false);
    // Display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
  }
}
// Check chords for validity and highlight invalid chords.
const checkChords = () => {
  const chords = [
    document.getElementById('chordInput1').value,
    document.getElementById('chordInput2').value,
    document.getElementById('chordInput3').value,
    document.getElementById('chordInput4').value
  ];

  const isGood = (chord) => {
    if (!chord) {
      return false;
    }
    try {
      mm.chords.ChordSymbols.pitches(chord);
      return true;
    }
    catch (e) {
      return false;
    }
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
    console.log("Disposing arp RNN Model");
    rnnModel.dispose();
    instrumentConfig['currentModel'] = ''
  }
}


export { generateChordSequence, initializeChordModel, disposeChordModel, exportChordSequence, replayChordSequence };