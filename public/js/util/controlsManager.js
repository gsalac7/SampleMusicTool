import * as Nexus from 'nexusui';
import { toggleRecording, exportMIDI } from './recordingManager';
import { toggleLoop, updateSequencer } from './drumManager';
import { replayMusicRNNSequence, exportMusicRNNSequence, initializeRNNModel, generateMusicRNNSequence, setSeedSequence, readMidi, disposeRNNModel } from '../models/music_rnn';
import { initializeMusicVaeModel, generateMusicVAESequence, replayMusicVAESequence, exportMusicVAESequence, disposeVAEModel } from '../models/music_vae';
import { initializeChordModel, generateChordSequence, replayChordSequence, exportChordSequence, disposeChordModel } from '../models/chord_improv';
import { initializeArpModel, generateArpSequence, disposeArpModel, replayArpSequence, exportArpSequence } from '../models/arp_rnn';
import checkpoints from './configs/checkpoints.json';
import { instrumentConfig } from './configs/instrumentConfig';

let currentModel = instrumentConfig['currentModel']; 
let checkpoint = instrumentConfig['checkpoint'];

export function initializeControls() {
    const buttonConfig = {
        'toggleRecording': [toggleRecording, 'Toggle recording button not found'],
        'exportMidi': [exportMIDI, 'Export MIDI button not found'],
        'play-button': [() => toggleLoop(document.getElementById('play-button')), 'Play button not found'],
        'updateSequencer': [updateSequencer, 'Update sequencer button not found'],
    };

    for (const [btnId, config] of Object.entries(buttonConfig)) {
        initializeButton(btnId, config[0], config[1]);
    }

    initTempSlider();
    initBPMSlider();
    initStepsSelector();
    initLengthField();
    initCheckpointSelector();
    initSeedSequencer();
    initModelControl();
    initializationButtonListener();
}

const modelConfig = {
    MusicRNN: {
        initCallback: initializeRNNModel,
        generateCallback: generateMusicRNNSequence,
        replayCallback: replayMusicRNNSequence,
        exportCallback: exportMusicRNNSequence,
        disposeCallback: disposeRNNModel,
        logMessage: "Initializing MusicRNN Model",
    },
    MusicVAE: {
        initCallback: initializeMusicVaeModel,
        generateCallback: generateMusicVAESequence,
        replayCallback: replayMusicVAESequence,
        exportCallback: exportMusicVAESequence,
        disposeCallback: disposeVAEModel,
        logMessage: "Initializing MusicVAE Model",
    },
    ArpRNN: {
        initCallback: initializeArpModel,
        generateCallback: generateArpSequence,
        replayCallback: replayArpSequence,
        exportCallback: exportArpSequence,
        disposeCallback:  disposeArpModel,
        logMessage: "Initializing Arp RNN Model",
    },
    ChordImprov: {
        initCallback: initializeChordModel,
        generateCallback: generateChordSequence,
        replayCallback: replayChordSequence,
        exportCallback: exportChordSequence,
        disposeCallback:  disposeChordModel,
        logMessage: "Initializing Chord Improv Model",

    }
}

function initModelControl() {
    const buttons = document.querySelectorAll('.model-btn');
    const checkpointDropdown = document.getElementById('checkpoint-select'); // Get the checkpoint dropdown
    
    // Control Panel will store this value
    checkpointDropdown.addEventListener('change', ()=> {
        const selectedValue = checkpointDropdown.value;
        checkpoint = selectedValue;
        instrumentConfig['checkpoint'] = checkpoint;
    });
}


function initializationButtonListener() {
    const initModelButton = document.getElementById('init-button');

    if (!initModelButton) {
        console.error('Initialize Model button not found');
        return;
    }

    // Attach click listener to the initialization button
    initModelButton.addEventListener('click', () => {
        if (!checkpoint) {
            alert('Please select a checkpoint');
            return;
        }

        // Determine the new model based on the checkpoint
        let newModel;
        if (checkpoint.includes("rnn")) {
            newModel = "MusicRNN";
        } else if (checkpoint.includes("Arpeggiator Improv")){
            newModel = "ArpRNN";
        } else if (checkpoint.includes("Chord Melody Improv")) {
            newModel = "ChordImprov";
        } else {
            newModel = "MusicVAE";
        }
        instrumentConfig['currentModel'] = newModel;

        // Dispose of the current model if it exists
        if (currentModel) {
            if (modelConfig[currentModel] && typeof modelConfig[currentModel].disposeCallback === 'function') {
                modelConfig[currentModel].disposeCallback();
            }
        }

        // Initialize the new model
        if (modelConfig[newModel] && typeof modelConfig[newModel].initCallback === 'function') {
            modelConfig[newModel].initCallback(checkpoints[checkpoint]['url']);
            initializeButton('generateMusic', modelConfig[newModel].generateCallback, 'Generate Music button not found');
            initializeButton('replay-button', modelConfig[newModel].replayCallback, 'Replay button not found');
            initializeButton('download-link', modelConfig[newModel].exportCallback, 'Export button not found');
            // Update currentModel to be the newModel for the next iteration
            currentModel = newModel;
        } else {
            console.error(`Initialization callback not found for model: ${newModel}`);
        }
        // Unhide the proper controls for the specific model
        if (newModel == "MusicRNN") {
            document.getElementById('seed-selector').style.display = 'block';
            document.getElementById('Arp-Chord-Selector').style.display = 'none';
            // Set Event Listener for seed-selector
        } else if (newModel == "ArpRNN") {
            document.getElementById('seed-selector').style.display = 'none';
            document.getElementById('Arp-Chord-Selector').style.display = 'block';
            // set Event listener for arp-chord-selector
            const arpField = document.getElementById('chordInput');
            if (arpField) {
                arpField.addEventListener('change', function () {
                    const selectedValue = this.value;
                    instrumentConfig['arpChord'] = selectedValue;
                });
            } else {
                console.error('Arp Chord select field not found');
            }
        } else if (newModel == "ChordImprov") {
            document.getElementById('seed-selector').style.display = 'none';
            document.getElementById('Arp-Chord-Selector').style.display = 'none';
            document.getElementById('Chord-Melody-Selector').style.display = 'block';
            // set Event listener for arp-chord-selector
            const chordField = document.getElementById('chordInput');
            if (chordField) {
                chordField.addEventListener('change', function () {
                    const selectedValue = this.value;
                    instrumentConfig['arpChord'] = selectedValue;
                });
                // probably create a list of the chords set here
            } else {
                console.error('Arp Chord select field not found');
            }

        }
    });
}

function initializeButton(buttonId, callback, errorMessage) {
    const button = document.getElementById(buttonId);
    if (button) {
        // Consider removing old event listeners to avoid duplicates
        button.removeEventListener('click', callback);
        button.addEventListener('click', callback);
    } else {
        console.error(errorMessage);
    }
}

// Field for the length of the sequence
function initLengthField() {
    const field = document.getElementById('length-input');
    if (field) {
        field.addEventListener('change', function () {
            const selectedValue = this.value;
            instrumentConfig['length'] = parseInt(selectedValue, 10);
        });
    } else {
        console.error('length select field not found');
    }
}

// dropdown to select the amount of steps per quarter
function initStepsSelector() {
    const dropdown = document.getElementById('steps-select');
    if (dropdown) {
        dropdown.addEventListener('change', function () {
            const selectedValue = this.value;
            instrumentConfig['stepsPerQuarter'] = parseInt(selectedValue, 10);
            // convert to int

        });
    } else {
        console.error('Step Selector Dropdown not found');
    }
}

function initSeedSequencer() {
    const dropdown = document.getElementById('seed-select');
    if (dropdown) {
        dropdown.addEventListener('change', function () {
            const selectedValue = this.value;
            setSeedSequence(selectedValue);
        });
    } else {
        console.error('Dropdown not found');
    }
    document.getElementById('midiFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('midi-filename').innerText = file.name;
            readMidi(file);
        }
    });
}

// applies to specific model
function initTempSlider() {
    const tempSlider = new Nexus.Slider('#temp-slider', {
        size: [220, 20],
        mode: 'relative',
        min: 0,
        max: 2,
        step: 0.1,
        value: 1.0
    });
    tempSlider.on('change', function (value) {
        document.getElementById('temp-value').textContent = value.toFixed(1);
        // set the temperature for the model
        instrumentConfig['temperature'] = parseFloat(value);
    });

}

function initCheckpointSelector() {
    const selectElement = document.getElementById('checkpoint-select');
    const descriptionElement = document.getElementById('checkpoint-description');

    // Loop over the keys of the checkpoints object
    Object.keys(checkpoints).forEach(key => {
        const checkpoint = checkpoints[key];
        const optionElement = document.createElement('option');
        optionElement.value = key;  // The key is now the ID
        optionElement.textContent = key;
        optionElement.dataset.description = checkpoint.description;  // Access the description using the key
        selectElement.appendChild(optionElement);
    });

    // Event listener to show the description when a checkpoint is selected
    selectElement.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        descriptionElement.textContent = selectedOption.dataset.description;
    });
}

// APplies to the visualizer
function initBPMSlider() {
    const bpmSlider = new Nexus.Slider('#bpm-slider', {
        size: [220, 20],
        mode: 'relative',
        min: 60,
        max: 180,
        step: 1,
        value: 120
    });
    bpmSlider.on('change', function (value) {
        document.getElementById('bpm-value').textContent = value.toFixed(1);
        // Set the instrument Config BPM
        instrumentConfig['bpm'] = value;
    });
}