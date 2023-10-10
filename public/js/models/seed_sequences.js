export const seedSequences = {
  majorScaleUp: {
    notes: [
      { pitch: 60, startTime: 0, endTime: 0.5 }, // C4
      { pitch: 62, startTime: 0.5, endTime: 1.0 }, // D4
      { pitch: 64, startTime: 1.0, endTime: 1.5 }, // E4
      { pitch: 65, startTime: 1.5, endTime: 2.0 }, // F4
      { pitch: 67, startTime: 2.0, endTime: 2.5 }, // G4
      { pitch: 69, startTime: 2.5, endTime: 3.0 }, // A4
      { pitch: 71, startTime: 3.0, endTime: 3.5 }, // B4
      { pitch: 72, startTime: 3.5, endTime: 4.0 }, // C5
    ],
    totalTime: 4,
    quantizationInfo: { stepsPerQuarter: 4 }
  },
  majorScaleDown: {
    notes: [
      { pitch: 72, startTime: 3.5, endTime: 4.0 }, // C5
      { pitch: 71, startTime: 3.0, endTime: 3.5 }, // B4
      { pitch: 69, startTime: 2.5, endTime: 3.0 }, // A4
      { pitch: 67, startTime: 2.0, endTime: 2.5 }, // G4
      { pitch: 65, startTime: 1.5, endTime: 2.0 }, // F4
      { pitch: 64, startTime: 1.0, endTime: 1.5 }, // E4
      { pitch: 62, startTime: 0.5, endTime: 1.0 }, // D4
      { pitch: 60, startTime: 0, endTime: 0.5 }, // C4
    ],
    totalTime: 4,
    quantizationInfo: { stepsPerQuarter: 4 }
  },
  minorScaleUp: {
    notes: [
      { pitch: 57, startTime: 0, endTime: 0.5 }, // A3
      { pitch: 59, startTime: 0.5, endTime: 1.0 }, // B3
      { pitch: 60, startTime: 1.0, endTime: 1.5 }, // C4
      { pitch: 62, startTime: 1.5, endTime: 2.0 }, // D4
      { pitch: 64, startTime: 2.0, endTime: 2.5 }, // E4
      { pitch: 65, startTime: 2.5, endTime: 3.0 }, // F4
      { pitch: 67, startTime: 3.0, endTime: 3.5 }, // G4
      { pitch: 69, startTime: 3.5, endTime: 4.0 }, // A4
    ],
    totalTime: 4,
    quantizationInfo: { stepsPerQuarter: 4 }
  },
  minorScaleDown: {
    notes: [
      { pitch: 69, startTime: 3.5, endTime: 4.0 }, // A4
      { pitch: 67, startTime: 3.0, endTime: 3.5 }, // G4
      { pitch: 65, startTime: 2.5, endTime: 3.0 }, // F4
      { pitch: 64, startTime: 2.0, endTime: 2.5 }, // E4
      { pitch: 62, startTime: 1.5, endTime: 2.0 }, // D4
      { pitch: 60, startTime: 1.0, endTime: 1.5 }, // C4
      { pitch: 59, startTime: 0.5, endTime: 1.0 }, // B3
      { pitch: 57, startTime: 0, endTime: 0.5 }, // A3
    ],
    totalTime: 4,
    quantizationInfo: { stepsPerQuarter: 4 }
  }
};
