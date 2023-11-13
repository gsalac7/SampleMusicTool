import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, playGeneratedSequenceDefault } from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';
import { sampleSequences } from './configs/sample_sequences';

let music_vae;
let generatedSequence;

function initializeGroovaeModel(checkpoint) {
    instrumentConfig['currentModel'] = "MusicVAE";
    console.log("Checkpooint: " + checkpoint);
    music_vae = new mm.MusicVAE(checkpoint);
    music_vae.initialize().then(function () {
        console.log('Model initialized');
        hideLoader();
        showNotification("MusicVAE Model initialized Successfully!");
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });
}

function disposeGroovaeModel() {
    if (music_vae) {
        music_vae.dispose();
        instrumentConfig['currentModel'] = '';
    }
}

async function generateGroovaeSequence() {
    console.log("Executing GroovoaeSquence");
    let temperature = instrumentConfig['temperature'];
    const melodicSequence = sampleSequences['majorScaleUp'];
    console.log(melodicSequence);
    // Encode the melodic sequence into a latent representation
    const z = await music_vae.encode([melodicSequence]);
    // Decode the latent representation to generate a drum sequence
    generatedSequence = await music_vae.decode(z, temperature, undefined, 4);
    console.log("Generated Sequence: " + JSON.stringify(generatedSequence, null, 2));
    if (generatedSequence) {

        playGeneratedSequenceSoundFont(generatedSequence[0])

        // display replay-button and download link
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
    }
}

function replayGroovaeSequence() {
    playGeneratedSequenceSoundFont(generatedSequence[0], false) // should no longer be normalized
}

function readMidi(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const midi = new Uint8Array(event.target.result);
            // Convert MIDI to NoteSequence
            const noteSequence = await mm.midiToSequenceProto(midi);
            // Use noteSequence as your seed
            seedSequence = noteSequence;
        };
        reader.readAsArrayBuffer(file);
    }
}
async function exportGroovaeSequence() {
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

export { exportGroovaeSequence, generateGroovaeSequence, initializeGroovaeModel, disposeGroovaeModel, replayGroovaeSequence }
