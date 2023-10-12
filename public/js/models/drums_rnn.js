import * as mm from '@magenta/music';

let drums_rnn = mm.MusicRNN("https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn");
await drums_rnn.initialize();

// 3. Define a seed sequence.
const primerSeq = {
    notes: [],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 1
};

// 4. Generate a continuation.
const steps = 32; // The number of steps to continue.
const temperature = 1.5; // Determines the randomness of the output.
const generatedSequence = await drumsRNN.continueSequence(primerSeq, steps, temperature);

// 5. Play the generated sequence (optional).
const player = new mm.Player();
player.start(generatedSequence);

// Remember to dispose of the model when done.
drumsRNN.dispose();
