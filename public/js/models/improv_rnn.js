import * as mm from '@magenta/music';
// Number of steps to play each chord.
STEPS_PER_CHORD = 8;
STEPS_PER_PROG = 4 * STEPS_PER_CHORD;

// Number of times to repeat chord progression.
NUM_REPS = 4;

// Set up Improv RNN model and player.
const model = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
const player = new mm.Player();
var playing = false;

// Current chords being played.
var currentChords = undefined;

// Sample over chord progression.
const playOnce = () => {
  const chords = currentChords;
  
  // Prime with root note of the first chord.
  const root = mm.chords.ChordSymbols.root(chords[0]);
  const seq = { 
    quantizationInfo: {stepsPerQuarter: 4},
    notes: [],
    totalQuantizedSteps: 1
  };  
  
  document.getElementById('message').innerText = 'Improvising over: ' + chords;
  model.continueSequence(seq, STEPS_PER_PROG + (NUM_REPS-1)*STEPS_PER_PROG - 1, 0.9, chords)
    .then((contSeq) => {
      // Add the continuation to the original.
      contSeq.notes.forEach((note) => {
        note.quantizedStartStep += 1;
        note.quantizedEndStep += 1;
        seq.notes.push(note);
      });
    
      const roots = chords.map(mm.chords.ChordSymbols.root);
      for (var i=0; i<NUM_REPS; i++) { 
        // Add the bass progression.
        seq.notes.push({
          instrument: 1,
          program: 32,
          pitch: 36 + roots[0],
          quantizedStartStep: i*STEPS_PER_PROG,
          quantizedEndStep: i*STEPS_PER_PROG + STEPS_PER_CHORD
        });
        seq.notes.push({
          instrument: 1,
          program: 32,
          pitch: 36 + roots[1],
          quantizedStartStep: i*STEPS_PER_PROG + STEPS_PER_CHORD,
          quantizedEndStep: i*STEPS_PER_PROG + 2*STEPS_PER_CHORD
        });
        seq.notes.push({
          instrument: 1,
          program: 32,
          pitch: 36 + roots[2],
          quantizedStartStep: i*STEPS_PER_PROG + 2*STEPS_PER_CHORD,
          quantizedEndStep: i*STEPS_PER_PROG + 3*STEPS_PER_CHORD
        });
        seq.notes.push({
          instrument: 1,
          program: 32,
          pitch: 36 + roots[3],
          quantizedStartStep: i*STEPS_PER_PROG + 3*STEPS_PER_CHORD,
          quantizedEndStep: i*STEPS_PER_PROG + 4*STEPS_PER_CHORD
        });        
      }
    
      // Set total sequence length.
      seq.totalQuantizedSteps = STEPS_PER_PROG * NUM_REPS;
    
      // Play it!
      player.start(seq, 120).then(() => {
        playing = false;
        document.getElementById('message').innerText = 'Change chords and play again!';
        checkChords();
      });
    })
}  

// Check chords for validity and highlight invalid chords.
const checkChords = () => {
  const chords = [
    document.getElementById('chord1').value,
    document.getElementById('chord2').value,
    document.getElementById('chord3').value,
    document.getElementById('chord4').value
  ]; 
 
  const isGood = (chord) => {
    if (!chord) {
      return false;
    }
    try {
      mm.chords.ChordSymbols.pitches(chord);
      return true;
    }
    catch(e) {
      return false;
    }
  }
}