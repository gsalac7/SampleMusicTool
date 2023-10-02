const sounds = {
    kick: new Audio('../sounds/drum-kit/electronic/kick.mp3'),
    snare: new Audio('../sounds/drum-kit/electronic/snare.mp3'),
    hihat: new Audio('../sounds/drum-kit/electronic/hihat.mp3'),
    // add more sounds as needed
};
const sequencer = document.getElementById('sequencer');
const playButton = document.getElementById('play-button');

const numRows = 3;
const numCols = 16;
const grid = Array.from({ length: numRows }, () => Array(numCols).fill(false));

function createSequencer() {
    grid.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        sequencer.appendChild(rowDiv); // appending rowDiv to sequencer

        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.addEventListener('click', () => {
                grid[rowIndex][colIndex] = !grid[rowIndex][colIndex];
                cellDiv.classList.toggle('active');
            });
            rowDiv.appendChild(cellDiv);
        });
    });
}


playButton.addEventListener('click', () => {
    let currentStep = 0;
    setInterval(() => {
        grid.forEach((row, rowIndex) => {
            if (row[currentStep]) {
                sounds[Object.keys(sounds)[rowIndex]].play();
            }
        });
        currentStep = (currentStep + 1) % numCols;
    }, 500); // Set interval duration as desired
});

export { createSequencer};
