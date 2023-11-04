import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { playGeneratedSequenceSoundFont } from './visualizer';
import { note } from 'tonal';

let rnnModel;
let generatedSequence;

// initialize the AI Model with chord improv
function initializeArpModel(checkpoint) {
  instrumentConfig['currentModel'] = "ArpRNN";
  rnnModel = new mm.MusicRNN(checkpoint);
  rnnModel.initialize().then(function () {
    console.log('Arp Model initialized');
  }).catch(function (error) {
    console.error('Failed to initialize model:', error);
  });
}

async function generateArpSequence() {
  let temperature = instrumentConfig['temperature'];
  let chord = instrumentConfig['arpChord'];
  let note = noteToPitch(chord);

  const quantizedSeq= {
    quantizationInfo: { stepsPerQuarter: 4 },
    notes: [{pitch: note, quantizedStartStep: 0, quantizedEndStep: 1}],
    totalQuantizedSteps: 1
  };

  generatedSequence = await rnnModel.continueSequence(quantizedSeq, 20, temperature, [chord]);
  let normalizedSequence= extendSequence(generatedSequence, chord);

  if (generatedSequence) {
    // Normalize to an arpeggiated sequence
    console.log(normalizedSequence)
    playGeneratedSequenceSoundFont(normalizedSequence, false);
    // display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
  }
}

function noteToPitch(note, octave = 4) {
  const noteMap = {
    'C': 0,
    'Cm': 0,
    'C#': 1,
    'Db': 1,
    'Dm': 1,
    'D': 2,
    'D#': 3,
    'Eb': 3,
    'Em': 3,
    'E': 4,
    'F': 5,
    'Fm': 5,
    'F#': 6,
    'Gb': 6,
    'G': 7,
    'Gm': 7,
    'G#': 8,
    'Ab': 8,
    'A': 9,
    'Am': 9,
    'A#': 10,
    'Bb': 10,
    'B': 11,
    'Bm': 11
  };

  return 12 * (octave + 1) + noteMap[note.toUpperCase()];
}

function extendSequence(generatedSequence) {
  // Create an empty array to hold the extended notes
  let extendedNotes = [];

  // Convert totalQuantizedSteps to a number
  let totalSteps = Number(generatedSequence.totalQuantizedSteps);

  // Loop to repeat the notes 4 times
  for (let i = 0; i < 4; i++) {
    // Adjust each note's start and end steps and add to extendedNotes
    generatedSequence.notes.forEach(originalNote => {
      let note = {...originalNote};
      note.quantizedStartStep = Number(originalNote.quantizedStartStep) + i * totalSteps;
      note.quantizedEndStep = Number(originalNote.quantizedEndStep) + i * totalSteps;
      extendedNotes.push(note);
    });
  }

  // Replace the original notes array with the extended one
  generatedSequence.notes = extendedNotes;

  // Update totalQuantizedSteps to reflect the repetition
  generatedSequence.totalQuantizedSteps = String(totalSteps * 4);

  return generatedSequence;
}

async function exportArpSequence() {
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

function replayArpSequence() {
  playGeneratedSequenceSoundFont(generatedSequence, false);
}

function disposeArpModel() {
  if (rnnModel) {
    console.log("Disposing arp RNN Model");
    rnnModel.dispose();
    instrumentConfig['currentModel'] = ''
  }
}


export { generateArpSequence, initializeArpModel, disposeArpModel, exportArpSequence, replayArpSequence }