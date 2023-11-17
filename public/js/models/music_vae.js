import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, clearVisualizer } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';

let music_vae;
let generatedSequence;
let shouldNormalize;

async function initializeMusicVaeModel(checkpoint) {
    clearVisualizer();
    instrumentConfig['currentModel'] = "MusicVAE";
    music_vae = new mm.MusicVAE(checkpoint);

    try {
        await music_vae.initialize();
        console.log('Model initialized');
        hideLoader();
        showNotification("MusicVAE Model initialized Successfully!");
    } catch (error) {
        console.error('Failed to initialize model:', error);
    }

    shouldNormalize = checkpoint.includes("trio") || checkpoint.includes('multi') || 
                      checkpoint.includes('drum') || checkpoint.includes("groove");
}


function disposeVAEModel() {
  if (music_vae) {
    console.log("Disposing MusicVAE Model");
    music_vae.dispose();
    instrumentConfig['currentModel'] = '';
    generatedSequence = null;
    clearVisualizer();
    // rehide the replay and download buttons
    document.getElementById('replay-button').style.display = 'none';
    document.getElementById('download-link').style.display = 'none';
  }
}

async function generateMusicVAESequence() {
  let temperature = instrumentConfig['temperature'];
  generatedSequence = await music_vae.sample(1, temperature);
  let sequence = JSON.parse(JSON.stringify(generatedSequence[0]));

  if (sequence) {
    playGeneratedSequenceSoundFont(sequence);
    // display replay-button and download link
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
  }
}

function replayMusicVAESequence() {
  let sequence = JSON.parse(JSON.stringify(generatedSequence[0]));
  playGeneratedSequenceSoundFont(sequence, shouldNormalize);
}

async function exportMusicVAESequence() {
  // Assign program 9 to all notes
  let sequence = JSON.parse(JSON.stringify(generatedSequence[0]));
  sequence.notes.forEach(note => {
      note.velocity=127;
  });
  const midiBytes = mm.sequenceProtoToMidi(sequence);
  const midiBlob = new Blob([new Uint8Array(midiBytes)], { type: 'audio/midi-file' });

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
