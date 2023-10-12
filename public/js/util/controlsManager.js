import * as Nexus from 'nexusui';
import { toggleRecording, exportMIDI } from './recordingManager';
import { toggleLoop, updateSequencer, setBPMSequencer } from './drumManager';
import { replaySequence, exportSequence, initializeRNNModel, setLength, setSteps, generateMusicRNNSequence, setTemperature, setSeedSequence, readMidi, disposeRNNModel } from '../models/music_rnn';
import { setBPM } from '../models/visualizer';
import { initializeMusicVaeModel, generateMusicVAESequence, exportMusicVAESequence, disposeVAEModel} from '../models/music_vae';
import checkpoints from './configs/checkpoints.json';


let currentModel = 'MusicRNN'; // default Model to use
export function initializeControls() {
    const buttonConfig = {
        'toggleRecording': [toggleRecording, 'Toggle recording button not found'],
        'exportMidi': [exportMIDI, 'Export MIDI button not found'],
        'play-button': [() => toggleLoop(document.getElementById('play-button')), 'Play button not found'],
        'updateSequencer': [updateSequencer, 'Update sequencer button not found'],
        'replay-button': [replaySequence, 'Replay button not found'],
        'download-link': [exportSequence, 'Export button not found']
    };

    for (const [btnId, config] of Object.entries(buttonConfig)) {
        initializeButton(btnId, config[0], config[1]);
    }

    initModelBtn();
    initTempSlider();
    initBPMSlider();
    initStepsSelector();
    initLengthField();
    initCheckpointSelector();
    initSeedSequencer();

    attachInitializationButtonListener()
}

const modelConfig = {
    MusicRNN: {
        initCallback: initializeRNNModel,
        generateCallback: generateMusicRNNSequence,
        logMessage: "Initializing MusicRNN Model"
    },
    MusicVAE: {
        initCallback: initializeMusicVaeModel,
        generateCallback: generateMusicVAESequence,
        logMessage: "Initializing MusicVAE Model"
    }
}

function initModelBtn() {
    const buttons = document.querySelectorAll('.model-btn');
    const checkpointDropdown = document.getElementById('checkpoint-select'); // Get the checkpoint dropdown
    
    // Get references to the Length and Steps per Quarter containers
    checkpointDropdown.addEventListener('change', initializeModelWithCheckpoint);

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Toggle 'active' class for buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedValue = this.getAttribute('data-value');
            const selectedCheckpoint = checkpointDropdown.value; // Get the selected checkpoint value

            if (modelConfig[selectedValue]) {
                console.log(modelConfig[selectedValue].logMessage);
                initializeButton('generateMusic', modelConfig[selectedValue].generateCallback, `${selectedValue} generate music button not found`);
                
                // Pass the selected checkpoint to the initCallback
                modelConfig[selectedValue].initCallback(selectedCheckpoint);
            }
        });
    });
}

function initializeModelWithCheckpoint() {
    // Get the active model button (either MusicRNN or MusicVAE)
    const activeButton = document.querySelector('.model-btn.active');
    if (!activeButton) {
        console.error('No active model button found');
        return;
    }

    const model = activeButton.getAttribute('data-value');

    // Get the selected checkpoint from the dropdown
    const checkpointDropdown = document.getElementById('checkpoint-select');
    if (!checkpointDropdown) {
        console.error('Checkpoint dropdown not found');
        return;
    }
    const selectedCheckpoint = checkpointDropdown.value;

    console.log("selectedCheckpoint: " + selectedCheckpoint)

    // Initialize the chosen model with the selected checkpoint
    if (modelConfig[model] && typeof modelConfig[model].initCallback === 'function') {
        console.log("Calling initializeMOdel")
        modelConfig[model].initCallback(selectedCheckpoint);
    } else {
        console.error(`Initialization callback not found for model: ${model}`);
    }
}

function attachInitializationButtonListener() {
    const initModelButton = document.getElementById('init-button');
    
    if (!initModelButton) {
        console.error('Initialize Model button not found');
        return;
    }
    
    // Attach click listener to the initialization button
    initModelButton.addEventListener('click', initializeModelWithCheckpoint);
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
            setLength(selectedValue);
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
            setSteps(selectedValue);
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
        setTemperature(value);
    });

}

function initCheckpointSelector() {
    const selectElement = document.getElementById('checkpoint-select');
    const descriptionElement = document.getElementById('checkpoint-description');

    checkpoints.forEach(checkpoint => {
        const optionElement = document.createElement('option');
        optionElement.value = checkpoint.id;
        optionElement.textContent = checkpoint.id;
        optionElement.dataset.description = checkpoint.description;  // Store the description in a data attribute
        selectElement.appendChild(optionElement);
    });

    // Event listener to show the description when a checkpoint is selected
    selectElement.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        descriptionElement.textContent = selectedOption.dataset.description;
    });
}

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
        setBPM(value);
        setBPMSequencer(value);
    });
}