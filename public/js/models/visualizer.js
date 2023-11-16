import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';

let visualizer;
const soundFontUrl = instrumentConfig['soundFontUrl'];
const soundFontData = instrumentConfig['soundFontData'];
let player = null;
let activeInstrument;

// Use the custom soundfont
function initializeVisualizerSoundFont() {
    if (!player) {
        player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
            run: note => visualizer.redraw(note),
            stop: () => { }
        });
    } else {
        if (player.isPlaying()) {
            player.stop();
        }
    }
}

// USe the default instruments 
function initializeVisualizerDefault() {
    if (!player) {
        player = new mm.Player(false, {
            run: note => visualizer.redraw(note),
            stop: () => { }
        });
    } else {
        if (player.isPlaying()) {
            player.stop();
        }
    }
}

function stopPlayer() {
    if (player) {
        player.stop();
    }
}


function clearVisualizer() {
    if (visualizer) {
        visualizer.clear();
    }
}
function setInstrument(instrument) {
    activeInstrument = instrument
}

// Assign instruments to each trio, multi, drum, and groove
function normalizeSequence(sequence, shouldNormalize = true) {
    if (!shouldNormalize) return;
    console.log("Normalizing Sequence: "  + JSON.stringify(sequence, null, 2));
    sequence.notes.forEach(note => {
        if (note.isDrum) {
            note.program = setInstrumentNumber('percussion');  // Instrument #9 for drums
            delete note.isDrum;  // Remove the isDrum attribute
        } else {
            switch (note.instrument) {
                case 0:  // melody
                    note.program = setInstrumentNumber('acoustic_grand_piano');
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

function playGeneratedSequenceSoundFont(generatedSeq, shouldNormalize = true) {
    let BPM = instrumentConfig['bpm'];
    initializeVisualizerSoundFont();
    player.setTempo(BPM);
    generatedSeq.notes.forEach(note => {
        note.velocity = 127;  // Max velocity
    });

    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollSVGVisualizer(generatedSeq, document.getElementById('svg-container'), config);

    if (shouldNormalize) {
        normalizeSequence(generatedSeq);
    } else {
        let num = setActiveInstrumentNumber();
        generatedSeq.notes.forEach(note => {
            note.program = num;  // Set to the desired instrument index
            note.velocity = 127; // set the velocity for everything to 127; max volume
        });
    }
    // Start the player
    player.start(generatedSeq);
    console.log(generatedSeq);
}

function playGeneratedSequenceDefault(generatedSequence) {
    initializeVisualizerDefault();
    console.log(generatedSequence);
    let BPM = instrumentConfig['bpm'];
    player.setTempo(BPM);
    const config = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollSVGVisualizer(generatedSequence, document.getElementById('svg-container'), config);

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

export { setInstrument, playGeneratedSequenceSoundFont, playGeneratedSequenceDefault, stopPlayer, clearVisualizer}