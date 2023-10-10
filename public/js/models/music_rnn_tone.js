import * as mm from '@magenta/music';
import * as Tone from 'tone';
import { startNote, stopNote, convertPitchToNoteString } from '../util/synthManager';
import { seedSequences} from './seed_sequences';

const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

let BPM = 120;
let temperature = 1.0;
let seedSequence = seedSequences['majorScaleUp']; // defualt seed Sequence

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
    const generatedSeq = await rnnModel.continueSequence(quantizedSeq, 40, temperature); 
    
    if (generatedSeq) {
        
        playGeneratedSequence(generatedSeq);
        document.getElementById('replay-button').style.display = 'inline-block'; // or 'block', depending on your layout
    }
}

function playGeneratedSequence(seq) {
    const stepsPerQuarter = 4;
    const timePerStep = 1 / ((BPM / 60) * stepsPerQuarter);
    const startTime = Tone.now();
    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '8, 41, 64',
        activeNoteRGB: '240, 84, 119',
    };
    const visualizer = new mm.PianoRollCanvasVisualizer(seq, document.getElementById('canvas'), config);


    seq.notes.forEach(note => {
        const noteString = convertPitchToNoteString(note.pitch);
        const noteStartTime = startTime + note.quantizedStartStep * timePerStep;
        const noteEndTime = startTime + note.quantizedEndStep * timePerStep;

        Tone.Transport.schedule(() => {
            startNote(noteString);
            visualizer.redraw(note);
        }, noteStartTime);

        Tone.Transport.schedule(() => {
            stopNote(noteString);
            visualizer.redraw(note);
        }, noteEndTime);
    });
   
    Tone.Transport.start();
}

function setBPM(newBPM) {
    BPM = newBPM;
}

function setTemperature(newTemperature) {
    temperature = newTemperature;
}

export { playGeneratedSequence, initializeModel, generateSequence, setBPM, setTemperature, setSeedSequence };
