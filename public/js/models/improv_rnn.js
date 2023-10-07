import * as magenta from '@magenta/music';
import { indexToPianoNote, playNote } from '../util/synthManager'; // Replace with actual import

// Load the Improv RNN model
const improvRnn = new magenta.ImprovRnn('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');

// Set up the Improv RNN model
improvRnn.initialize();

// This function can be used to generate a melody when a note is played
async function generateMelody(seedNoteIndex) {
  const seedNote = indexToPianoNote(seedNoteIndex);

  if (!seedNote) {
    console.error('Invalid seed note index');
    return;
  }

  // Convert the seed note to a Magenta.js NoteSequence
  const seedSequence = magenta.sequences.quantizeNoteSequence(
    {notes: [{pitch: magenta.data.pianoNoteToNoteNumber(seedNote), startTime: 0, endTime: 0.5}], totalTime: 0.5},
    1
  );

  // Generate a melody using the Improv RNN model
  const generatedSequence = await improvRnn.continueSequence(seedSequence, 20, 1.0);

  // Convert the generated NoteSequence back to piano notes and play them
  generatedSequence.notes.forEach(note => {
    const pianoNote = magenta.data.noteNumberToPianoNote(note.pitch);
    playNote(pianoNote); // You may need to adjust the timing between notes
  });
}

// When a note is played, trigger melody generation
document.getElementById('piano').addEventListener('notePlayed', event => {
  generateMelody(event.detail.noteIndex); // Replace 'event.detail.noteIndex' with actual data
});
