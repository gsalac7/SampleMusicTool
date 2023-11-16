import Nexus from 'nexusui';
import { Midi } from '@tonejs/midi';

const sounds = {
    0: new Audio('./public/sounds/drum-kits/electronic/kick.mp3'),
    1: new Audio('./public/sounds/drum-kits/electronic/snare.mp3'),
    2: new Audio('./public/sounds/drum-kits/electronic/hihat-closed.mp3'),
    3: new Audio('./public/sounds/drum-kits/electronic/hihat-open.mp3'),
    4: new Audio('./public/sounds/drum-kits/electronic/ride.mp3'),
    5: new Audio('./public/sounds/drum-kits/electronic/clap.mp3'),
};

let isPlaying = false;
let intervalID;
let sequencer;
let currentBpm = 120;

function initializeSequencer(rows, columns) {
    sequencer = new Nexus.Sequencer('#sequencer', {
        'size': [1200, 400],
        'mode': 'toggle',
        'rows': rows,
        'columns': columns 
    });

    const cells = document.querySelectorAll('#sequencer span');
    cells.forEach((cell, index) => {
        if (index % 4 === 3) {
            cell.style.marginRight = '8px'; // Adjust as needed
        }
    });
    

    sequencer.colorize("accent", "#FF0000");
    sequencer.colorize("fill", "#FFFFF");

    sequencer.on('change', function (v) {
        playSound(v);
    });
}

function playSound(v) {
    if (v.state) {
        sounds[v.row].currentTime = 0;
        sounds[v.row].play();
    }
}

function stopLoop() {
    clearInterval(intervalID);
}

function toggleLoop(playButton) {
    if (isPlaying) {
        stopLoop();
        playButton.innerText = 'Play';
        playButton.className = 'play';
        isPlaying = false;
    } else {
        startLoop(currentBpm);
        playButton.innerText = 'Stop';
        playButton.className = 'stop';
        isPlaying = true;
    }
}

function startLoop(bpm) {
    let currentColumn = 0;
    const interval = (60000 / bpm) / 4;

    intervalID = setInterval(() => {
        highlightColumn(currentColumn);
        for (let row = 0; row < 6; row++) {
            if (sequencer.matrix.pattern[row][currentColumn]) {
                playSound({ row: row, state: true });
            }
        }
        currentColumn = (currentColumn + 1) % 16;
    }, interval);
}


function highlightColumn(currentColumn) {
    const allCells = document.querySelectorAll('#sequencer span');
    allCells.forEach(cell => cell.classList.remove('cell-highlight')); // Reset highlight class

    if (currentColumn < 0) return; // For resetting highlight, no further action needed

    for (let i = currentColumn; i < allCells.length; i += 16) {
        allCells[i].classList.add('cell-highlight'); // Add class for emphasis
    }
}

function handleBarAndBeatChange(bars, beatsPerBar) {
    const rows = 6; // number of drum sounds
    const columns = bars * beatsPerBar * 4; // assuming 4 sub-divisions (16th notes) per beat
    initializeSequencer(rows, columns);
}

function updateSequencer() {
    sequencer.destroy();
    const bars = parseInt(document.getElementById('bars').value, 10);
    const beatsPerBar = parseInt(document.getElementById('beatsPerBar').value, 10);
    handleBarAndBeatChange(bars, beatsPerBar);
}

function setBPMSequencer(bpm) {
    currentBpm = bpm;
}

function exportDrumMIDI() {
    // Create a new MIDI file
    const midi = new Midi();
    const track = midi.addTrack();
    const ticksPerBeat = midi.header.ticksPerBeat;
    const noteDuration = 60000 / currentBpm / 4;  // Duration of a 16th note at current BPM

    // Assuming each row corresponds to a different MIDI note number
    const rowToMIDINoteMap = [36, 38, 42, 46, 49, 51]; // Adjust based on your setup

    for (let row = 0; row < sequencer.matrix.pattern.length; row++) {
        for (let column = 0; column < sequencer.matrix.pattern[row].length; column++) {
            if (sequencer.matrix.pattern[row][column]) {
                const midiNote = rowToMIDINoteMap[row];
                const startTime = (column * noteDuration) / 1000; // Start time in seconds
                const duration = noteDuration / 1000; // Duration in seconds

                track.addNote({
                    midi: midiNote,
                    time: startTime,
                    duration: duration
                });
            }
        }
    }

    // Convert MIDI to binary and create a Blob
    const midiBinary = midi.toArray();
    const blob = new Blob([midiBinary], { type: 'audio/midi' });

    // Create and click a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sequencer-output.midi';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


export { initializeSequencer, toggleLoop, updateSequencer, setBPMSequencer, exportDrumMIDI};
