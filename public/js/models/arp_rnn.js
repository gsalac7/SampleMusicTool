import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { playGeneratedSequenceSoundFont, clearVisualizer } from './visualizer';
import { hideLoader, showNotification } from '../util/controlsManager';

let rnnModel;
let generatedSequence;

async function initializeArpModel(checkpoint) {
    instrumentConfig['currentModel'] = "ArpRNN";
    rnnModel = new mm.MusicRNN(checkpoint);

    try {
        await rnnModel.initialize();
        console.log('Arp Model initialized');
        hideLoader();
        showNotification("Arp Model Initialized");
        document.getElementById('generateMusic').style.display = 'inline-block';
    } catch (error) {
        console.error('Failed to initialize model:', error);
    }
}

async function generateArpSequence() {
  let temperature = instrumentConfig['temperature'];
  let chord = instrumentConfig['arpChord'];
  let stepsPerQuarter = instrumentConfig['stepsPerQuarter']; // Assuming this is set correctly in your config

  const stepsPerBar = 4 * stepsPerQuarter; // 4 beats in a bar for 4/4 time signature
  const barLength = instrumentConfig['numBars']; 
  const totalSteps = stepsPerBar * barLength; // Total steps for one bar

  const quantizedSeq = {
    quantizationInfo: { stepsPerQuarter: stepsPerQuarter },
    notes: [],
    totalQuantizedSteps: totalSteps
  };

  // Generate a one-bar sequence
  let generatedSeq = await rnnModel.continueSequence(quantizedSeq, totalSteps, temperature, [chord]);

  // Loop the generated sequence 4 times
  let loopedSequence = loopSequence(generatedSeq, 4);
  loopedSequence['model'] = 'ArpRNN';

  if (loopedSequence) {
    playGeneratedSequenceSoundFont(loopedSequence, false);
    generatedSequence = JSON.parse(JSON.stringify(loopedSequence));
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'inline-block';
    document.getElementById('loop-button').style.display = 'inline-block';
  }
}

function loopSequence(sequence, times) {
  let loopedSequence = {
    ...sequence,
    notes: []
  };

  for (let i = 0; i < times; i++) {
    sequence.notes.forEach(note => {
      let clonedNote = { ...note, quantizedStartStep: note.quantizedStartStep + i * sequence.totalQuantizedSteps, quantizedEndStep: note.quantizedEndStep + i * sequence.totalQuantizedSteps };
      loopedSequence.notes.push(clonedNote);
    });
  }

  loopedSequence.totalQuantizedSteps = sequence.totalQuantizedSteps * times;
  return loopedSequence;
}

async function exportArpSequence() {
  console.log(generatedSequence);
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
    clearVisualizer();
    console.log("Disposing arp RNN Model");
    rnnModel.dispose();
    instrumentConfig['currentModel'] = ''
    generatedSequence = null;
    document.getElementById('replay-button').style.display = 'none';
    document.getElementById('download-link').style.display = 'none';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('loop-button').style.display = 'none';
  }
}


export { generateArpSequence, initializeArpModel, disposeArpModel, exportArpSequence, replayArpSequence }