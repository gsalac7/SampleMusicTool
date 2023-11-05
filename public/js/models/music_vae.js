import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';

let music_vae;
let generatedSequence;
let numSequences = 1;
let player = "default";

function initializeMusicVaeModel(checkpoint) {
  instrumentConfig['currentModel'] = "MusicVAE";
  music_vae = new mm.MusicVAE(checkpoint);
  music_vae.initialize().then(function () {
    alert("MusicVAE Model Initialized")
    console.log('Model initialized');
  }).catch(function (error) {
    console.error('Failed to initialize model:', error);
  });

  if (checkpoint.includes('multi')) {
    player = "default"
  }
}

function disposeVAEModel() {
  if (music_vae) {
    music_vae.dispose();
    instrumentConfig['currentModel'] = '';
  }
}

async function generateMusicVAESequence() {
  let temperature = instrumentConfig['temperature'];
  let chords = ['C', 'Am', 'F', 'G'];
  console.log("Generating with chords: " + chords + " and temperature: " + temperature)
  generatedSequence = await music_vae.sample(1, null, {"chordProgression": chords}, 16);
  if (generatedSequence) {
    if (player == "soundfont") {
      playGeneratedSequenceSoundFont(generatedSequence[0])
    } else {
      playGeneratedSequenceDefault(generatedSequence[0]);
    }
    // display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
  }
}

function replayMusicVAESequence() {
  if (player == "default") {
    playGeneratedSequenceDefault(generatedSequence[0])
  } else {
    playGeneratedSequenceSoundFont(generatedSequence[0], false) // should no longer be normalized
  }
}

async function exportMusicVAESequence() {
  const midiBytes = mm.sequenceProtoToMidi(generatedSequence[0]);
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

export { exportMusicVAESequence, generateMusicVAESequence, initializeMusicVaeModel, disposeVAEModel, replayMusicVAESequence }
