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


function playGeneratedSequenceSoundFont(generatedSequence) {
    initializeVisualizerSoundFont();
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
    let programNum = setInstrumentNumber();

    generatedSequence.notes.forEach(note => {
        note.program = programNum;  // Set to the desired instrument index
        note.velocity = 127; // set the velocity for everything to 127; max volume
    });

    player.start(generatedSequence);
}

function playGeneratedSequenceDefault(generatedSequence) {
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

function setInstrumentNumber() {
    for (const [key, value] of Object.entries(soundFontData.instruments)) {
        if (value === activeInstrument) {
            return parseInt(key, 10);  // Also fixed a typo here: parseint -> parseInt
        }
    }
    return null;
}

export { setInstrument, playGeneratedSequenceSoundFont, playGeneratedSequenceDefault, setBPM }