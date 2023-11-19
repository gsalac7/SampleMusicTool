import { initializeMidi } from './util/midiHandler';
import { initializePianoUI, initializeSynth } from './util/synthManager';
import { initializeSequencer } from './util/drumManager';
import { initializeControls } from './util/controlsManager';

window.onload = () => {
  initializeSynth();
  initializePianoUI();
  initializeMidi();
  initializeSequencer(6, 16);
  initializeControls();
}