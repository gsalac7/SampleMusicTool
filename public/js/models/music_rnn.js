import * as mm from '@magenta/music';
import * as Tone from 'tone'; // Ensure Tone.js is imported
import { activeSynth, playNote, stopNote, convertPitchToNoteString } from '../util/synthManager';

const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

async function generateSequence() {
    await rnnModel.initialize();
    const seedSeq = {
        notes: [
            { pitch: 60, startTime: 0, endTime: 0.5 },   // C4
            { pitch: 64, startTime: 0.5, endTime: 1.0 },  // E4
            { pitch: 67, startTime: 1.0, endTime: 1.5 },  // G4
            { pitch: 64, startTime: 1.5, endTime: 2.0 },  // E4
        ],
        totalTime: 2,
        quantizationInfo: { stepsPerQuarter: 4 }
    };

    const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSeq, 4);
    const generatedSeq = await rnnModel.continueSequence(quantizedSeq, 40, 1.5);

    playGeneratedSequence(generatedSeq);
}

function playGeneratedSequence(seq) {
    const beatsPerMinute = 120; // Set your desired BPM
    const stepsPerQuarter = 4; // Retrieve this value from seq if it's dynamic
    const timePerStep = 1 / ((beatsPerMinute / 60) * stepsPerQuarter);

    const startTime = Tone.now();

    // Config for the visualizer
    const config = {
        noteHeight: 10, // Adjust the height of each note
        pixelsPerTimeStep: 150, // Increase space for each time step
        noteRGB: '8, 41, 64',
        activeNoteRGB: '240, 84, 119',
    };

    // Create a visualizer instance with canvas rendering
    const visualizer = new mm.PianoRollCanvasVisualizer(seq, document.getElementById('canvas'), config);

    seq.notes.forEach(note => {
        const noteString = convertPitchToNoteString(note.pitch); // Convert pitch to note string
        const noteStartTime = startTime + note.quantizedStartStep * timePerStep;
        const noteEndTime = startTime + note.quantizedEndStep * timePerStep;

        Tone.Transport.schedule(() => {
            playNote(noteString); // Trigger note on
            visualizer.redraw(note, true); // Note On: You might need to modify this line to suit the visualizer's API
        }, noteStartTime);

        Tone.Transport.schedule(() => {
            stopNote(noteString); // Trigger note off
            visualizer.redraw(note, false); // Note Off: You might need to modify this line to suit the visualizer's API
        }, noteEndTime);
    });
    

    Tone.Transport.start();
}

export { generateSequence };
