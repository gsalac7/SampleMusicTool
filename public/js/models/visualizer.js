import * as mm from '@magenta/music';
import { instrumentConfig } from '../util/configs/instrumentConfig';

let visualizer = null;
const soundFontUrl = instrumentConfig['soundFontUrl'];
const soundFontData = instrumentConfig['soundFontData'];
let player = null;
let activeInstrument;
let isLooping = false;

function initializeVisualizerAndPlayer(sequence) {
    // Initialize the visualizer with the sequence
    const visualizerConfig = {
        noteHeight: 10,
        pixelsPerTimeStep: 150,
        noteRGB: '211, 211, 211',
        activeNoteRGB: '240, 84, 119',
    };

    visualizer = new mm.PianoRollSVGVisualizer(sequence, document.getElementById('svg-container'), visualizerConfig);

    // Initialize the SoundFontPlayer
    player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
        run: note => visualizer.redraw(note),
        stop: () => {}
    });
}

function stopPlayer() {
    if (player) {
        player.stop();
    }
}

function clearVisualizer() {
    stopPlayer();
    if (visualizer) {
        visualizer.clear();
        visualizer.clearActiveNotes();
        document.getElementById('replay-button').style.display = 'none';
        document.getElementById('download-link').style.display = 'none';
        document.getElementById('stop-button').style.display = 'none';
        document.getElementById('loop-button').style.display = 'none';
        player = null;
        visualizer = null;
    }
}
function setInstrument(instrument) {
    activeInstrument = instrument
}

function displayControls() {
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('download-link').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'inline-block';
    document.getElementById('loop-button').style.display = 'inline-block';
}

// Assign instruments to each trio, multi, drum, and groove
function normalizeSequence(sequence, shouldNormalize = true) {
    if (!shouldNormalize) return;
    sequence.notes.forEach(note => {
        note.velocity = 127;  // Max velocity
        if (note.isDrum) {
            note.program = setInstrumentNumber('percussion');  // Instrument #9 for drums
            delete note.isDrum;  // Remove the isDrum attribute
        } else {
            switch (note.instrument) {
                case 0:  // melody
                    note.program = setInstrumentNumber(activeInstrument);
                    break;
                case 1:  // bassline
                    note.program = setInstrumentNumber('synth_bass_1');
                    break;
                default:
                    note.program = setInstrumentNumber(activeInstrument);  // fallback to piano
            }
        }
    });
}

function playGeneratedSequenceSoundFont(generatedSeq, shouldNormalize = true) {
    stopPlayer();
    generatedSeq.notes.forEach(note => {
        note.velocity = 127;  // Max velocity
    });

    if (shouldNormalize) {
        normalizeSequence(generatedSeq);
    } else {
        let num = setActiveInstrumentNumber();
        generatedSeq.notes.forEach(note => {
            note.program = num;  // Set to the desired instrument index
            note.velocity = 127; // set the velocity for everything to 127; max volume
        });
    }
    initializeVisualizerAndPlayer(generatedSeq);
    let BPM = instrumentConfig['bpm'];
    player.setTempo(BPM);
    // Set the isLooping variable based on the loop button's state
    isLooping = instrumentConfig['loopSequence'];
    // Check if the player is not already playing
    if (!player.isPlaying()) {
        playSequence(generatedSeq)
    }
}

function playSequence(generatedSeq) {
    let BPM = instrumentConfig['bpm'];
    player.setTempo(BPM);
    if (!player.isPlaying()) {
        player.start(generatedSeq).then(() => {
            // After the sequence has finished playing, check if we should loop
            if (instrumentConfig.loopSequence) {
                playSequence(generatedSeq);
            }
        });
    }
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
            console.log("Active Instrument: " + activeInstrument);
            return parseInt(key, 10);  // Also fixed a typo here: parseint -> parseInt
        }
    }
    return null;
}

export { setInstrument, playGeneratedSequenceSoundFont, stopPlayer, clearVisualizer, displayControls}