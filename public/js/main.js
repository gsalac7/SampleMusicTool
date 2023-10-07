import './models/music_rnn.js'
import { initializeMidi } from './util/midiHandler';
import { exportMIDI, toggleRecording } from './util/recordingManager';
import { initializePianoUI, initializeSynth} from './util/synthManager';
import { initializeSequencer, toggleLoop, updateSequencer } from './util/drumManager';
import { initializeBpmDial } from './util/bpmManager';
import { generateSequence} from './models/music_rnn';

window.onload = () => {
  // Init UI Elements
  initializeSynth();
  initializePianoUI();
  initializeMidi();
  initializeSequencer(6, 16);
  initializeBpmDial();


  // Init buttons
  const toggleRecordingButton = document.getElementById("toggleRecording");
  if (toggleRecordingButton) {
    toggleRecordingButton.addEventListener('click', toggleRecording);
  } else {
    console.error('Toggle recording button not found');
  }
  // Add event listener for the music generation button
  const generateMusicButton = document.getElementById('generateMusic');
  if (generateMusicButton) {
    generateMusicButton.addEventListener('click', generateSequence);
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
  console.log("Initialzed");
  const playButton = document.getElementById("play-button");
  if (playButton) {
    console.log("Play pressed");
    playButton.addEventListener('click', function () {
      toggleLoop(playButton);
    });
  } else {
    console.error('Play button not found');
  }

  const updateSequencerButton = document.getElementById('updateSequencer');
  if (updateSequencerButton) {
    updateSequencerButton.addEventListener('click', updateSequencer);
  } else {
    console.error('Update sequencer button not found');
  }
};
