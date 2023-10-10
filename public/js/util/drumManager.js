import Nexus from 'nexusui';

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
        'size': [800, 400],
        'mode': 'toggle',
        'rows': rows,
        'columns': columns 
    });

    const cells = document.querySelectorAll('#sequencer span');
    cells.forEach((cell, index) => {
        if (index % 4 === 3) {
            cell.style.marginRight = '4px'; // Adjust as needed
        }
    });
    

    sequencer.colorize("accent", "#ff0000");
    sequencer.colorize("fill", "#333");

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
    const bars = parseInt(document.getElementById('bars').value, 10);
    const beatsPerBar = parseInt(document.getElementById('beatsPerBar').value, 10);
    handleBarAndBeatChange(bars, beatsPerBar);
}

function setBPMSequencer(bpm) {
    currentBpm = bpm;
}


export { initializeSequencer, toggleLoop, updateSequencer, setBPMSequencer};
