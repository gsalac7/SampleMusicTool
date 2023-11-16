import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, clearVisualizer} from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification } from '../util/controlsManager';
import { sampleSequences } from './configs/sample_sequences';

let music_vae;
let generatedSequence;
let seedSequence;

function initializeGroovaeModel(checkpoint) {
  clearVisualizer();
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
        generatedSequence = null;
        document.getElementById('replay-button').style.display = 'none';
        document.getElementById('download-link').style.display = 'none';
    }
}

async function generateGroovaeSequence() {
    let temperature = instrumentConfig['temperature'];
    if (seedSequence == undefined) {
        seedSequence = sampleSequences['majorScaleUp'];
    }

    console.log(seedSequence);
    seedSequence.tempos.forEach((tempo) => {
        tempo.qpm = 120; // Set to your desired tempo
    });
    // Encode the melodic sequence into a latent representation
    const z = await music_vae.encode([seedSequence]);
    // Decode the latent representation to generate a drum sequence
    generatedSequence = await music_vae.decode(z, temperature, undefined, 4);
    if (generatedSequence) {
        console.log("Generated Sequence: " + JSON.stringify(generatedSequence, null, 2));

        playGeneratedSequenceSoundFont(generatedSequence[0])

        // display replay-button and download link
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
    }
}

function replayGroovaeSequence() {
    playGeneratedSequenceSoundFont(generatedSequence[0], false) // should no longer be normalized
}

function readSampleMidi(file) {
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
    // Specify the number of steps per quarter note for quantization
    const STEPS_PER_QUARTER = 16;
    const quantizedSequence = mm.sequences.quantizeNoteSequence(generatedSequence[0], STEPS_PER_QUARTER);
    quantizedSequence.notes = quantizedSequence.notes.map(note => {
        const { startTime, endTime, ...restOfNote } = note;
        return restOfNote;
    });
    console.log("quantizedSequence: " + JSON.stringify(quantizedSequence, null, 2));
    const midiBytes = mm.sequenceProtoToMidi(quantizedSequence);
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

export { exportGroovaeSequence, generateGroovaeSequence, initializeGroovaeModel, disposeGroovaeModel, replayGroovaeSequence, readSampleMidi }
