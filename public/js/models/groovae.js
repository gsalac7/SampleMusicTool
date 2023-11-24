import * as mm from '@magenta/music';
import { playGeneratedSequenceSoundFont, clearVisualizer, displayControls} from './visualizer';
import { instrumentConfig } from '../util/configs/instrumentConfig';
import { hideLoader, showNotification, hideSvgLoader, showSvgLoader } from '../util/controlsManager';
import { sampleSequences } from './configs/sample_sequences';

let music_vae;
let generatedSequence;
let seedSequence;

async function initializeGroovaeModel(checkpoint) {
    instrumentConfig['currentModel'] = "MusicVAE";
    music_vae = new mm.MusicVAE(checkpoint);

    try {
        await music_vae.initialize();
        hideLoader();
        showNotification("MusicVAE Model initialized Successfully!");
        document.getElementById('generateMusic').style.display = 'inline-block';
    } catch (error) {
        console.error('Failed to initialize model:', error);
    }
}

function disposeGroovaeModel() {
    if (music_vae) {
        clearVisualizer();
        music_vae.dispose();
        instrumentConfig['currentModel'] = '';
        generatedSequence = null;
    }
}

async function generateGroovaeSequence() {
    showSvgLoader();
    let temperature = instrumentConfig['temperature'];
    if (!seedSequence) {
        seedSequence = sampleSequences['majorScaleUp'];
    }

    seedSequence.tempos.forEach((tempo) => {
        tempo.qpm = 120; // Set to your desired tempo
    });
    // Encode the melodic sequence into a latent representation
    const z = await music_vae.encode([seedSequence]);
    // Decode the latent representation to generate a drum sequence
    generatedSequence = await music_vae.decode(z, temperature, undefined, 4);
    let sequence = JSON.parse(JSON.stringify(generatedSequence[0]));
    if (generatedSequence) {
        hideSvgLoader();
        playGeneratedSequenceSoundFont(sequence)
        // display replay-button and download link
        displayControls();
    }
}

function replayGroovaeSequence() {
    let sequence = JSON.parse(JSON.stringify(generatedSequence[0]));
    playGeneratedSequenceSoundFont(sequence) // should no longer be normalized
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
