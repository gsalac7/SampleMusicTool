import * as Nexus from 'nexusui';
import { toggleRecording, exportMIDI } from './recordingManager';
import { toggleLoop, updateSequencer, setBPMSequencer } from './drumManager';
import { setLength, setSteps, exportSequence, generateSequence, setBPM, setTemperature, setSeedSequence, playGeneratedSequence} from '../models/music_rnn';

export function initializeControls() {
    initializeButton('toggleRecording', toggleRecording, 'Toggle recording button not found');
    initializeButton('generateMusic', generateSequence, 'Generate music button not found');
    initializeButton('exportMidi', exportMIDI, 'Export MIDI button not found');
    initializeButton('play-button', () => toggleLoop(document.getElementById('play-button')), 'Play button not found');
    initializeButton('updateSequencer', updateSequencer, 'Update sequencer button not found');
    initializeButton('replay-button', playGeneratedSequence, 'Replay button not found');
    initializeButton('download-link', exportSequence, 'Export button not found');

    //initPopup();
    initSeedSequencer();

    initModelBtn();
    initTempSlider();
    initBPMSlider();
    initStepsSelector();
    initLengthField();
};

function initModelBtn() {
    const buttons = document.querySelectorAll('.model-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add 'active' class to the clicked button
            this.classList.add('active');
            
            // Retrieve the value of the selected button if needed
            const selectedValue = this.getAttribute('data-value');
            console.log(selectedValue);
        });
    });
}
function initializeButton(buttonId, callback, errorMessage) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', callback);
    } else {
        console.error(errorMessage);
    }
}


// Field for the length of the sequence
function initLengthField() {
    const field = document.getElementById('length-input');
    if (field) {
        field.addEventListener('change', function() {
            const selectedValue = this.value;
            /*
            if (selectedValue < 1 || selectedValue > 50) {
                showPopup("The Length must be a number between 1 and 50");
            } 
            */
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
        dropdown.addEventListener('change', function() {
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
        dropdown.addEventListener('change', function() {
            const selectedValue = this.value;
            setSeedSequence(selectedValue);
        });
    } else {
        console.error('Dropdown not found');
    }
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

function initPopup() {
    document.getElementById('btn').addEventListener('click', function() {
        // You can change this message to whatever you want the popup to display
        showPopup("Your custom message goes here");
      });
}
function showPopup(message) {
    console.log("Execute show popup");
    var popup = document.getElementById('popup');
    var popupMessage = document.getElementById('popup-message');
    popupMessage.innerText = message; // Set the message
    popup.style.display = 'block'; // Show the popup
  }

function closePopup() {
    var popup = document.getElementById('popup');
    popup.style.display = 'none';
}