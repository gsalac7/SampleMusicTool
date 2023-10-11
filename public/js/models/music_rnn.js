
import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';

//const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
//const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');

let BPM = 120;
let temperature = 1.0;
let seedSequence = seedSequences['majorScaleUp'];
let generatedSequence;
let activeInstrument;
let visualizer;
let length = 50; // set default length to 50
let steps = 4; // set default steps to 4h
const soundFontUrl = '../SampleMusicTool/public/sounds/soundfont';
const soundFontData = {
  "name": "sgm_plus",
  "instruments": {
    "0": "acoustic_grand_piano",
    "1": "acoustic_guitar_steel",
    "2": "acoustic_bass",
    "3": "distortion_guitar",
    "4": "marimba",
    "5": "synth_bass_1",
    "6": "xylophone",
  }
}

const player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
    run: note => visualizer.redraw(note),
    stop: () => { }
});

function setSeedSequence(newSeedSequence) {
    seedSequence = seedSequences[newSeedSequence];
    console.log("Seed sequence set to: " + newSeedSequence);
}

function initializeModel() {
    rnnModel.initialize().then(function () {
        console.log('Model initialized');
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });
}

async function generateSequence() {
    console.log("Current Steps: " + steps);
    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, steps);
    console.log("Current Length: " + length);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, length, temperature);
    if (generatedSequence) {
        playGeneratedSequence();
        // display replay-button and downloadlink
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('download-link').style.display = 'inline-block';
    }
}

function playGeneratedSequence() {
    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    //visualizer = new mm.PianoRollCanvasVisualizer(generatedSequence, document.getElementById('canvas'), config);

    console.log(generatedSequence);
    visualizer = new mm.PianoRollSVGVisualizer(generatedSequence, document.getElementById('svg-container'), config);

    if (player.isPlaying()) {
        player.stop();
    }
    let num = setInstrumentNumber();

    generatedSequence.notes.forEach(note => {
        note.program = num;  // Set to the desired instrument index
        note.velocity = 127; // set the velocity for everything to 127; max volume
    });

    player.start(generatedSequence);
}

function setBPM(newBPM) {
    BPM = parseInt(newBPM, 10);
    player.setTempo(BPM);
}

function setTemperature(newTemperature) {
    temperature = newTemperature;
}

function setInstrument(instrument) {
    activeInstrument = instrument;
}

function setLength(newLength) {
    length = parseInt(newLength, 10);
}

function setSteps(newSteps) {
    steps = parseInt(newSteps, 10);
}

function setInstrumentNumber() {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === activeInstrument) {
            return parseInt(key, 10);
        }
    }
    return null; // or you can return -1 or any value that indicates not found
}

async function exportSequence() {
    const midiBytes = mm.sequenceProtoToMidi(generatedSequence);
    const midiBlob = new Blob([new Uint8Array(midiBytes)], {type: 'audio/midi'});

    // Create a download link and append it to the document
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(midiBlob);
    downloadLink.download = 'generated-music.mid';
    document.body.appendChild(downloadLink);

    // Programmatically click the download link to trigger the download, then remove the link
    downloadLink.click();
    document.body.removeChild(downloadLink);

}
/*
document.getElementById('download-link').addEventListener('click', async function() {

    // Code to generate the sequence...
    // Let's say the generated sequence is stored in the variable 'generatedSequence'

    // Convert the NoteSequence to a MIDI
    const midiBytes = mm.sequenceProtoToMidi(generatedSequence);
    const midiBlob = new Blob([new Uint8Array(midiBytes)], {type: 'audio/midi'});

    // Create a download link and append it to the document
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(midiBlob);
    downloadLink.download = 'generated-music.mid';
    document.body.appendChild(downloadLink);

    // Programmatically click the download link to trigger the download, then remove the link
    downloadLink.click();
    document.body.removeChild(downloadLink);
});*/

export { setLength, setSteps, exportSequence, setInstrument, playGeneratedSequence, initializeModel, generateSequence, setBPM, setTemperature, setSeedSequence };
