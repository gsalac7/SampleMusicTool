// Import the Magenta.js library
import * as mm from '@magenta/music';
import { playGeneratedSequence } from './visualizer';

// Load the pre-trained MusicVAE model
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_lokl_small');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/multitrack_med');
const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_lokl_q2');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_2bar_humanize');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar');
//let music_vae;
let generatedSequence;
let temperature = 1.0;
let numSequences = 1

function initializeMusicVaeModel(checkpoint) {
  //console.log("Checkpoint: " + checkpoint);
  //music_vae = new mm.MusicVAE(checkpoint);
  music_vae.initialize().then(function () {
    console.log('Model initialized');
  }).catch(function (error) {
    console.error('Failed to initialize model:', error);
  });
}

function disposeVAEModel() {
  if (music_vae) {
    music_vae.dispose();
  }
}

async function generateMusicVAESequence() {
  console.log("Generating Music VAE Sequence");
  generatedSequence = await music_vae.sample(numSequences, temperature);
  console.log("Music VAE sequence: " + JSON.stringify(generatedSequence));
  if (generatedSequence) {
    playGeneratedSequence(generatedSequence[0]);
    // display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
  }
}
async function exportMusicVAESequence() {
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
export { exportMusicVAESequence, generateMusicVAESequence, initializeMusicVaeModel, disposeVAEModel }