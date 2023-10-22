import * as mm from '@magenta/music';

let visualizer;
let activeInstrument;
let BPM = 120;

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
    "7": "acoustic_grand_piano",
    "8": "synth_drum",
    "9": "percussion",
    "10": "pad_3_polysynth"
  }
}
let player;

// Use the custom soundfont
function initializeVisualizerSoundFont() {
    player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
        run: note => visualizer.redraw(note),
        stop: () => { }
    });
}

// USe the default instruments 
function initializeVisualizerDefault() {
    player = new mm.Player({
        run: note => visualizer.redraw(note),
        stop: () => { }
    });
}

function setInstrument(instrument) {
    activeInstrument = instrument
}

function setBPM(newBPM) {
    BPM = parseInt(newBPM, 10);
    player.setTempo(BPM);
}


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
        note.velocity = 127;  // Max velocity
    });
}



function playGeneratedSequenceSoundFont(generatedSequence, shouldNormalize = true) {
    initializeVisualizerSoundFont();

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
    }
    // Start the player
    player.start(generatedSequence);
}


function playGeneratedSequenceDefault(generatedSequence) {
    console.log(generatedSequence);
    initializeVisualizerDefault();
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

/*
function setInstrumentNumber() {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === activeInstrument) {
            return parseInt(key, 10);  // Also fixed a typo here: parseint -> parseInt
        }
    }
    return null;
}
*/

export { setInstrument, playGeneratedSequenceSoundFont, playGeneratedSequenceDefault, setBPM }