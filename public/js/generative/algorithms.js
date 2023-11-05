// Setting up a synthesizer
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// Define a "jazz" scale
const jazzScale = ["C4", "D4", "E4", "F#4", "G4", "A#4", "B4"];

// Function to generate random index
function getRandomIndex(scale) {
  return Math.floor(Math.random() * scale.length);
}

// Function to create a melody based on "jazz" genre
function generateJazzMelody() {
  const melody = [];
  for (let i = 0; i < 8; i++) {
    melody.push(jazzScale[getRandomIndex(jazzScale)]);
  }
  return melody;
}

// Function to play the generated melody
function playMelody() {
  const melody = generateJazzMelody();
  melody.forEach((note, index) => {
    synth.triggerAttackRelease(note, "8n", Tone.now() + index * 0.5);
  });
}
