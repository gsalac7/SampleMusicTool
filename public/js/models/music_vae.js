import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';

let music_vae;
let generatedSequence;
let temperature = 1.0;
let numSequences = 1
let player = "soundfont";

function initializeMusicVaeModel(checkpoint) {
  music_vae = new mm.MusicVAE(checkpoint);
  music_vae.initialize().then(function () {
    console.log('Model initialized');
  }).catch(function (error) {
    console.error('Failed to initialize model:', error);
  });

  if (checkpoint.includes('groovae') || checkpoint.includes('drum') || checkpoint.includes('trio')) {
    player = "default"
  }
}

function disposeVAEModel() {
  if (music_vae) {
    music_vae.dispose();
  }
}

async function generateMusicVAESequence() {
  console.log("Generating Music VAE Sequence");
  generatedSequence = await music_vae.sample(numSequences, temperature);
  if (generatedSequence) {
    if (player == "default") {
      playGeneratedSequenceDefault(generatedSequence[0])
    } else {
      playGeneratedSequenceSoundFont(generatedSequence[0])
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
    playGeneratedSequenceSoundFont(generatedSequence[0])
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