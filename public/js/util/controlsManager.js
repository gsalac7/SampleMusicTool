import * as Nexus from 'nexusui';
import { toggleRecording, exportMIDI } from './recordingManager';
import { toggleLoop, updateSequencer, setBPMSequencer } from './drumManager';
import { replayMusicRNNSequence, exportMusicRNNSequence, initializeRNNModel, setLength, setSteps, generateMusicRNNSequence, setTemperature, setSeedSequence, readMidi, disposeRNNModel } from '../models/music_rnn';
import { setBPM } from '../models/visualizer';
import { initializeMusicVaeModel, generateMusicVAESequence, replayMusicVAESequence, exportMusicVAESequence, disposeVAEModel} from '../models/music_vae';
import checkpoints from './configs/checkpoints.json';


let currentModel; 
let checkpoint;
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
        logMessage: "Initializing MusicRNN Model"
    },
    MusicVAE: {
        initCallback: initializeMusicVaeModel,
        generateCallback: generateMusicVAESequence,
        replayCallback: replayMusicVAESequence,
        exportCallback: exportMusicVAESequence,
        disposeCallback: disposeVAEModel,
        logMessage: "Initializing MusicVAE Model"
    }
}

function initModelControl() {
    const buttons = document.querySelectorAll('.model-btn');
    const checkpointDropdown = document.getElementById('checkpoint-select'); // Get the checkpoint dropdown
    
    // Control Panel will store this value
    checkpointDropdown.addEventListener('change', ()=> {
        const selectedValue = checkpointDropdown.value;
        checkpoint = selectedValue;
    });

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Toggle 'active' class for buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedValue = this.getAttribute('data-value');

            // let the controlManager know which model is active
            if (modelConfig[selectedValue]) {
                currentModel = selectedValue;
            }
        });
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
        // Get the active model button (either MusicRNN or MusicVAE)
        if (!currentModel) {
            // Create an alert if no model is selected
            alert('Please select a model');
            return;
        }
        if (!checkpoint) {
            // Create an alert if no checkpoint is selected
            alert('Please select a checkpoint');
            return;
        }
        if (modelConfig[currentModel] && typeof modelConfig[currentModel].initCallback === 'function') {
            console.log("Calling initializeMOdel")
            modelConfig[currentModel].initCallback(checkpoints[checkpoint]['url']);
            // TODO Create a small Green popup that it is initialized
            alert("Model Initialized");

            // Now that the model is initialized we set the generateMusic Button and its callback
            initializeButton('generateMusic', modelConfig[currentModel].generateCallback, 'Generate Music button not found')
            initializeButton('replay-button', modelConfig[currentModel].replayCallback, 'Replay button not found')
            initializeButton('download-link', modelConfig[currentModel].exportCallback, 'export button not found')
        } else {
            console.error(`Initialization callback not found for model: ${currentModel}`);
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