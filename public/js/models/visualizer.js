import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';

let visualizer;
let BPM = instrumentConfig['bpm'];
const soundFontUrl = instrumentConfig['soundFontUrl'];
const soundFontData = instrumentConfig['soundFontData'];
let player;
let activeInstrument;

// Use the custom soundfont
function initializeVisualizerSoundFont() {
    player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
        run: note => visualizer.redraw(note),
        stop: () => { }
    });
}

// USe the default instruments 
function initializeVisualizerDefault() {
    player = new mm.Player(false, {
        run: note => visualizer.redraw(note),
        stop: () => { }

});
}

function setInstrument(instrument) {
    activeInstrument = instrument
}

// Assign instruments to each trio
function normalizeSequence(sequence, shouldNormalize = true) {
    if (!shouldNormalize) return;
    sequence.notes.forEach(note => {
        if (note.isDrum) {
            note.program = setInstrumentNumber('percussion');  // Instrument #9 for drums
            delete note.isDrum;  // Remove the isDrum attribute
        } else {
            // You can use a switch or if-else blocks to assign instruments
            switch (note.instrument) {
                case 0:  // melody
                    note.program = setInstrumentNumber('pad_3_polysynth');
                    break;
                case 1:  // bassline
                    note.program = setInstrumentNumber('synth_bass_1');
                    break;
                default:
                    note.program = 0;  // fallback to piano
            }
        }
    });
}

function playGeneratedSequenceSoundFont(generatedSequence, shouldNormalize = true) {
    console.log("PLaying using soundfont");
    initializeVisualizerSoundFont();
    player.setTempo(BPM);
    generatedSequence.notes.forEach(note => {
        note.velocity = 127;  // Max velocity
    });

    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollSVGVisualizer(generatedSequence, document.getElementById('svg-container'), config);

    // Stop player if it's currently playing
    if (player.isPlaying()) {
        player.stop();
    }

    if (shouldNormalize) {
        normalizeSequence(generatedSequence);
    } else {
        let num = setActiveInstrumentNumber();

        generatedSequence.notes.forEach(note => {
            note.program = num;  // Set to the desired instrument index
            note.velocity = 127; // set the velocity for everything to 127; max volume
        });
    }
    // Start the player
    player.start(generatedSequence);
}


function playGeneratedSequenceDefault(generatedSequence) {
    initializeVisualizerDefault();
    console.log(generatedSequence);
    player.setTempo(BPM);
    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollSVGVisualizer(generatedSequence, document.getElementById('svg-container'), config);

    if (player.isPlaying()) {
        player.stop();
    }
    // Play the sequence and use the callbacks to highlight the notes.
    player.start(generatedSequence);
}

function setInstrumentNumber(instrumentName) {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === instrumentName) {
            return parseInt(key, 10);
        }
    }
    return null;
}

function setActiveInstrumentNumber() {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === activeInstrument) {
            return parseInt(key, 10);  // Also fixed a typo here: parseint -> parseInt
        }
    }
    return null;
}

export { setInstrument, playGeneratedSequenceSoundFont, playGeneratedSequenceDefault }