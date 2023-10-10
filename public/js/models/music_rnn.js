
import * as mm from '@magenta/music';
import { seedSequences } from './seed_sequences';

const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

let BPM = 120;
let temperature = 1.0;
let seedSequence = seedSequences['majorScaleUp'];
let generatedSequence;
let activeInstrument;
let visualizer;
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
    seedSequence = newSeedSequence;
}

function initializeModel() {
    rnnModel.initialize().then(function () {
        console.log('Model initialized');
    }).catch(function (error) {
        console.error('Failed to initialize model:', error);
    });
}

async function generateSequence() {
    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, 4);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, 40, temperature);
    if (generatedSequence) {
        playGeneratedSequence();
        document.getElementById('replay-button').style.display = 'inline-block';
    }
}

function playGeneratedSequence() {
    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '8, 41, 64',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollCanvasVisualizer(generatedSequence, document.getElementById('canvas'), config);

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
    BPM = newBPM;
    player.setTempo(BPM);
}

function setTemperature(newTemperature) {
    temperature = newTemperature;
}

function setInstrument(instrument) {
    activeInstrument = instrument;
}

function setInstrumentNumber() {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === activeInstrument) {
            return parseInt(key, 10);
        }
    }
    return null; // or you can return -1 or any value that indicates not found
}

export { setInstrument, playGeneratedSequence, initializeModel, generateSequence, setBPM, setTemperature, setSeedSequence };
