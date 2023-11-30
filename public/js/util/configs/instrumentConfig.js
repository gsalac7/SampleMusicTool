const path = require('path');
export const instrumentConfig = {
    temperature: 1.0,
    stepsPerQuarter: "",
    length: "",
    bpm: 120,
    currentModel: "",
    checkpoint: "",
    arpChord: "",
    chordMelodySeq: "",
    seedSequence: "",
    numBars: "",
    loopSequence: false,
    soundFontUrl: path.join(__dirname, '/public/sounds/soundfont'), 
    soundFontData: {
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
            "10": "pad_3_polysynth",
            "11": "synthstrings_1",
            "12": "electric_piano_1"
        }
    }
}