function pitchToNote(pitch) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(pitch / 12) - 1;
    const note = pitch % 12;
    return notes[note] + octave;
}

const path = require('path');

function getSample(instrument) {
    let instrumentObj = {};
    // Assuming this code runs in a Node.js context and not directly in the browser
    for (let pitch = 21; pitch <= 108; pitch++) {
        let note = pitchToNote(pitch);
        // Construct the path relative to the current file location
        let soundPath = path.join(__dirname, `/public/sounds/soundfont/${instrument}/p${pitch}_v127.mp3`);
        instrumentObj[note] = soundPath;
    }
    return instrumentObj;
}


export { getSample }