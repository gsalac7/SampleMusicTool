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

function initializeSequencer() {
    sequencer = new Nexus.Sequencer('#sequencer', {
        'size': [800, 400],
        'mode': 'toggle',
        'rows': 6,
        'columns': 16
    });
    // Additional JS Code for Styling (if needed)
    // Add spaces every 4 beats
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
        const bpm = 100; // You might want to replace this with a dynamic value
        startLoop(bpm);
        playButton.innerText = 'Stop';
        playButton.className = 'stop';
        isPlaying = true;
    }
}

function startLoop(bpm = 80) {
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

export { initializeSequencer, toggleLoop };
