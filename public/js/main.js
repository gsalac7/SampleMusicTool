import './models/music_rnn.js'
import { initializeMidi } from './util/midiHandler';
import { exportMIDI, toggleRecording } from './util/recordingManager';
import {initializePianoUI, initializeSynth}  from './util/synthManager';
import { createSequencer } from './util/drumManager';

window.onload = () => {
  initializeSynth();
  initializePianoUI();
  initializeMidi();
  createSequencer();

  const toggleRecordingButton = document.getElementById("toggleRecording");
  if (toggleRecordingButton) {
    console.log("toggleRecordingButton found");
    toggleRecordingButton.addEventListener('click', toggleRecording);
  } else {
    console.error('Toggle recording button not found');
  }
  // Add event listener for the music generation button
  const generateMusicButton = document.getElementById('generateMusic');
  if (generateMusicButton) {
    generateMusicButton.addEventListener('click', generateAndPlayMusic);
  } else {
    console.error('Generate music button not found');
  }
  const exportMidiButton = document.getElementById('exportMidi');
  if (exportMidiButton) {
    console.log("exportMidiButton found");
    exportMidiButton.addEventListener('click', exportMIDI);
  } else {
    console.error('Export MIDI button not found');
  }
};
