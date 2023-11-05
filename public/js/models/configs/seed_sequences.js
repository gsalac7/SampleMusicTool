export const seedSequences = {
    majorScaleUp: {
        ticksPerQuarter: 220,
        totalTime: 1.0,
        timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
        tempos: [{ time: 0, qpm: 120 }],
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
    },
    maryHadALittleLamb: {
        ticksPerQuarter: 220,
        totalTime: 8.5,
        timeSignatures: [
            {
                time: 0,
                numerator: 4,
                denominator: 4
            }
        ],
        tempos: [
            {
                time: 0,
                qpm: 60
            }
        ],
        notes: [
            { pitch: 64, startTime: 0, endTime: 0.5 }, // E4
            { pitch: 62, startTime: 0.5, endTime: 1.0 }, // D4
            { pitch: 60, startTime: 1.0, endTime: 1.5 }, // C4
            { pitch: 62, startTime: 1.5, endTime: 2.0 }, // D4
            { pitch: 64, startTime: 2.0, endTime: 2.5 }, // E4
            { pitch: 64, startTime: 2.5, endTime: 3.0 }, // E4
            { pitch: 64, startTime: 3.0, endTime: 3.5 }, // E4
            { pitch: 62, startTime: 3.5, endTime: 4.0 }, // D4
            { pitch: 62, startTime: 4.0, endTime: 4.5 }, // D4
            { pitch: 62, startTime: 4.5, endTime: 5.0 }, // D4
            { pitch: 64, startTime: 5.0, endTime: 5.5 }, // E4
            { pitch: 67, startTime: 5.5, endTime: 6.0 }, // G4
            { pitch: 67, startTime: 6.0, endTime: 6.5 }, // G4
            { pitch: 64, startTime: 6.5, endTime: 7.0 }, // E4
            { pitch: 62, startTime: 7.0, endTime: 7.5 }, // D4
            { pitch: 60, startTime: 7.5, endTime: 8.0 }, // C4
        ]
    },
    fourChordProgression: {
        ticksPerQuarter: 220,
        totalTime: 4.0,
        timeSignatures: [
            {
                time: 0,
                numerator: 4,
                denominator: 4,
            }
        ],
        tempos: [
            {
                time: 0,
                qpm: 120,
            }
        ],
        notes: [
            // C Major Chord
            { pitch: 60, startTime: 0, endTime: 1 },  // C4
            { pitch: 64, startTime: 0, endTime: 1 },  // E4
            { pitch: 67, startTime: 0, endTime: 1 },  // G4

            // G Major Chord
            { pitch: 55, startTime: 1, endTime: 2 },  // G3
            { pitch: 59, startTime: 1, endTime: 2 },  // B3
            { pitch: 62, startTime: 1, endTime: 2 },  // D4

            // A Minor Chord
            { pitch: 57, startTime: 2, endTime: 3 },  // A3
            { pitch: 60, startTime: 2, endTime: 3 },  // C4
            { pitch: 64, startTime: 2, endTime: 3 },  // E4

            // F Major Chord
            { pitch: 53, startTime: 3, endTime: 4 },  // F3
            { pitch: 57, startTime: 3, endTime: 4 },  // A3
            { pitch: 60, startTime: 3, endTime: 4 },  // C4
        ],
    }
};
