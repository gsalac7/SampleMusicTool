
import * as mm from '@magenta/music';
import { seedSequences } from './seed_sequences';

const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

let BPM = 120;
let temperature = 1.0;
let seedSequence = seedSequences['majorScaleUp'];
let generatedSequence;

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

let visualizer;

// Set up the SoundFont player
const soundFontUrl = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

const player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
    run: note => visualizer.redraw(note),
    stop: () => {}
});

async function generateSequence() {
    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, 4);
    generatedSequence = await rnnModel.continueSequence(quantizedSeq, 40, temperature);
    if (generatedSequence) {
        generatedSequence.notes.forEach(note => {
            note.program = 12;  // Set to the desired instrument index
        });
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

    player.start(generatedSequence);
}

function setBPM(newBPM) {
    BPM = newBPM;
    player.setTempo(BPM);
}

function setTemperature(newTemperature) {
    temperature = newTemperature;
}

export { playGeneratedSequence, initializeModel, generateSequence, setBPM, setTemperature, setSeedSequence };
