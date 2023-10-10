export function transposeSequence(sequence, interval) {
  return {
    ...sequence,
    notes: sequence.notes.map(note => transposeNote(note, interval)),
  };
}

function transposeNote(note, interval) {
  return {
    ...note,
    pitch: note.pitch + interval,
  };
}
