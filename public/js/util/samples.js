function pitchToNote(pitch) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(pitch / 12) - 1;
    const note = pitch % 12;
    return notes[note] + octave;
}

function getSample(instrument) {
    let instrumentObj = {};
    for (let pitch = 21; pitch <= 108; pitch++) {
        let note = pitchToNote(pitch);
        instrumentObj[note] = `../SampleMusicTool/public/sounds/soundfont/${instrument}/p${pitch}_v127.mp3`;
    }
    return instrumentObj
}

export { getSample }