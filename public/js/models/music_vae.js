// Import the Magenta.js library
import * as mm from '@magenta/music';
import { seedSequences } from './configs/seed_sequences';

// Load the pre-trained MusicVAE model
const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
//const music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');

let BPM = 120;
let temperature = 1.0
let seedSequence = seedSequences['majorScaleUp'];
let generatedSequence;
let activeInstrument;
let visualizer;

const soundFontUrl = '../SampleMusicTool/public/sounds/soundfont';
const soundFontData = {
  "name": "sgm_plus",
  "instruments": {
    "0": "acoustic_grand_piano",
    "1": "acoustic_guitar_steel",
    "2": "acoustic_bass",
    "3": "distortion_guitar",
    "4": "marimba",
    "5": "synth_bass_1",
    "6": "xylophone",
  }
}
const player = new mm.SoundFontPlayer(soundFontUrl, undefined, undefined, undefined, {
  run: note => visualizer.redraw(note),
  stop: () => { }
});

function setSeedSequence(newSeedSequence) {
  seedSequence = seedSequences[newSeedSequence];
  console.log("Seed sequence set to: " + newSeedSequence);
}

function initializeMusicVaeModel() {
  music_vae.initialize().then(function () {
      console.log('Model initialized');
  }).catch(function (error) {
      console.error('Failed to initialize model:', error);
  });
}


async function generateSequence() {
  console.log("seedSequence: " + JSON.stringify(seedSequence));
  const quantizedSeq = mm.sequences.quantizeNoteSequence(seedSequence, 1);
  console.log("quantizedSeq: " + JSON.stringify(quantizedSeq));
  generatedSequence = await rnnModel.continueSequence(quantizedSeq, 40, temperature);
  if (generatedSequence) {
      playGeneratedSequence();
      document.getElementById('replay-button').style.display = 'inline-block';
  }
}

function playGeneratedSequence() {
  const config = {
      noteHeight: 10,
      pixelsPerTimeStep: 150,
      noteRGB: '8, 41, 64',
      activeNoteRGB: '240, 84, 119',
  };

  visualizer = new mm.PianoRollCanvasVisualizer(generatedSequence, document.getElementById('canvas'), config);

  if (player.isPlaying()) {
      player.stop();
  }
  let num = setInstrumentNumber();

  generatedSequence.notes.forEach(note => {
      note.program = num;  // Set to the desired instrument index
      note.velocity = 127; // set the velocity for everything to 127; max volume
  });

  player.start(generatedSequence);
}

function setBPM(newBPM) {
  BPM = newBPM;
  player.setTempo(BPM);
}

function setTemperature(newTemperature) {
  temperature = newTemperature;
}

function setInstrument(instrument) {
  activeInstrument = instrument;
}

function setInstrumentNumber() {
  for (const [key, value] of Object.entries(soundFontData.instruments)) {
      if (value === activeInstrument) {
          return parseInt(key, 10);
      }
  }
  return null; // or you can return -1 or any value that indicates not found
}

export { setInstrument, playGeneratedSequence, initializeMusicVaeModel, generateSequence, setBPM, setTemperature, setSeedSequence };