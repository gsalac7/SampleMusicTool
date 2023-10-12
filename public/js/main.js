import { initializeModel } from './models/music_rnn'
import { initializeMusicVaeModel } from './models/music_vae'
import { initializeMidi } from './util/midiHandler';
import { initializePianoUI, initializeSynth} from './util/synthManager';
import { initializeSequencer} from './util/drumManager';
import { initializeControls} from './util/controlsManager';

window.onload = () => {
  // Init UI Elements
  initializeSynth();
  initializePianoUI();
  initializeMidi();
  initializeSequencer(6, 16);
  initializeControls();

  // Initialize the models
}