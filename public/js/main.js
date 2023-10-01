import * as Tone from 'tone';
import * as mm from '@magenta/music';
import './models/music_rnn.js'
import { initializeMidi } from './util/midiHandler';
import { toggleRecording, isRecording, sequence } from './util/recordingManager';
import {initializePianoUI, initializeSynth}  from './util/pianoSynth';

window.onload = () => {
  initializeSynth('synth-select');
  initializePianoUI();
  initializeMidi();
  document.getElementById("toggleRecording").addEventListener("click", toggleRecording);
};
