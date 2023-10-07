import * as mm from '@magenta/music';
import * as synthManager from '../util/synthManager'; // Adjust the path as necessary
import * as Tone from 'tone'; // Ensure Tone.js is imported

const rnnModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
const rnnPlayer = new mm.Player();

const notesMapping = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export async function generateAndPlayMusic() {
    if (!rnnModel) {
        console.warn('Model not initialized');
        return;
    }

    // Seed NoteSequence - customize as needed
    let seq = {
        notes: [
            { pitch: 60, startTime: 0, endTime: 0.5 }, // ... other notes ...
        ],
        totalTime: 6, // Adjust totalTime
        quantizationInfo: { stepsPerQuarter: 4 }
    };

    seq = mm.sequences.quantizeNoteSequence(seq, 4);

    if (!mm.sequences.isQuantizedSequence(seq)) {
        console.error("Sequence is not properly quantized");
        return;
    }

    const continuation = await rnnModel.continueSequence(seq, 32, 1.6);
    if (!continuation) {
        console.error("Generated continuation is undefined or invalid");
        return;
    }


    const stepsPerQuarter = continuation.quantizationInfo.stepsPerQuarter;
    const timePerStep = 60 / stepsPerQuarter; // Adjust based on your BPM
    let currentTime = 0;
    const timeInterval = 100; // Set the interval time in milliseconds

    // Start the scheduler
    const scheduler = setInterval(() => {
        currentTime += timeInterval / 1000; // Convert interval to seconds

        continuation.notes.forEach(note => {
            const startTime = note.quantizedStartStep * timePerStep;
            const endTime = note.quantizedEndStep * timePerStep;
            
            if (Math.abs(currentTime - startTime) < (timeInterval / 1000 / 2)) {
                const noteString = synthManager.convertPitchToNoteString(note.pitch);
                synthManager.playNote(noteString);

                const noteDuration = (endTime - startTime) * 1000; // Convert to milliseconds
                setTimeout(() => {
                    synthManager.stopNote(noteString);
                }, noteDuration);
            }
        });

        // Optional: Stop the scheduler when done
        if (currentTime >= continuation.totalQuantizedSteps * timePerStep) {
            clearInterval(scheduler);
        }
    }, timeInterval);
    

    // Visualization Configuration
    const config = {
        noteHeight: 6,
        noteSpacing: 1,
        pixelsPerTimeStep: 80,
        noteRGB: '8, 41, 64',
        activeNoteRGB: '240, 84, 119'
    };

    // Visualize the generated music
    const viz = new mm.PianoRollCanvasVisualizer(continuation, document.getElementById('canvas'), config);
    /*
    rnnPlayer.start(continuation).then(() => {
        viz.stop();
    });
    */
    //rnnPlayer.on('samplePlayed', (sample) => viz.redraw(sample));
}

function convertPitchToNoteString(pitch) {
    const octave = Math.floor(pitch / 12) - 1;
    const noteInOctave = pitch % 12;
    const noteString = notesMapping[noteInOctave] + octave;
    return noteString;
}
