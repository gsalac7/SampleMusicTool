import * as Nexus from 'nexusui';
import { toggleRecording, exportMIDI } from './recordingManager';
import { toggleLoop, updateSequencer, setBPMSequencer } from './drumManager';
import { generateSequence, setBPM, setTemperature, setSeedSequence, playGeneratedSequence} from '../models/music_rnn';

export function initializeControls() {
    initializeButton('toggleRecording', toggleRecording, 'Toggle recording button not found');
    initializeButton('generateMusic', generateSequence, 'Generate music button not found');
    initializeButton('exportMidi', exportMIDI, 'Export MIDI button not found');
    initializeButton('play-button', () => toggleLoop(document.getElementById('play-button')), 'Play button not found');
    initializeButton('updateSequencer', updateSequencer, 'Update sequencer button not found');
    initializeButton('replay-button', playGeneratedSequence, 'Replay button not found');

    initSeedSequencer();

    initTempSlider();
    initBPMSlider();
};

function initializeButton(buttonId, callback, errorMessage) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', callback);
    } else {
        console.error(errorMessage);
    }
}



function initSeedSequencer() {
    const dropdown = document.getElementById('seed-select');
    const selectedValue = dropdown.value;
    setSeedSequence[selectedValue];
}

function initTempSlider() {
    const tempSlider = new Nexus.Slider('#temp-slider', {
        size: [120, 20],
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
        size: [120, 20],
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

