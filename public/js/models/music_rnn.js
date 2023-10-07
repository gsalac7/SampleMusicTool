import * as mm from '@magenta/music';
import * as synthManager from '../util/synthManager'; // Adjust the path as necessary

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
            { pitch: 60, startTime: 0, endTime: 0.5 },     // C4
            { pitch: 62, startTime: 0.5, endTime: 1.0 },   // D4
            { pitch: 64, startTime: 1.0, endTime: 1.5 },   // E4
            { pitch: 65, startTime: 1.5, endTime: 2.0 },   // F4
            { pitch: 67, startTime: 2.0, endTime: 2.5 },   // G4
            { pitch: 69, startTime: 2.5, endTime: 3.0 },   // A4
            { pitch: 71, startTime: 3.0, endTime: 3.5 },   // B4
            { pitch: 72, startTime: 3.5, endTime: 4.0 },   // C5
            { pitch: 71, startTime: 4.0, endTime: 4.5 },   // B4
            { pitch: 69, startTime: 4.5, endTime: 5.0 },   // A4
            { pitch: 67, startTime: 5.0, endTime: 5.5 },   // G4
            { pitch: 65, startTime: 5.5, endTime: 6.0 }    // F4
        ],
        totalTime: 10,
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
    const config = {
        noteHeight: 6,
        noteSpacing: 1,
        pixelsPerTimeStep: 80,  // This effectively zooms into the notes making them occupy more space.
        noteRGB: '8, 41, 64',
        activeNoteRGB: '240, 84, 119'
    };


    // Parse continuation sequence, trigger notes and update UI
    continuation.notes.forEach(note => {
        const startTime = note.startTime * 1000; // Convert to milliseconds
        const endTime = note.endTime * 1000; // Convert to milliseconds
        const noteString = convertPitchToNoteString(note.pitch);

        setTimeout(() => synthManager.playNote(noteString), startTime);
        setTimeout(() => synthManager.stopNote(noteString), endTime);
    });

    // Visualize the generated music (this is assuming you have some sort of canvas setup for visualization)

    const viz = new mm.Visualizer(continuation, document.getElementById('canvas'), config);
    rnnPlayer.start(continuation).then(() => {
        viz.stop();
    });
    rnnPlayer.on('samplePlayed', (sample) => viz.redraw(sample));
}

function convertPitchToNoteString(pitch) {
    const octave = Math.floor(pitch / 12) - 1;
    const noteInOctave = pitch % 12;
    const noteString = notesMapping[noteInOctave] + octave;
    return noteString;
}
