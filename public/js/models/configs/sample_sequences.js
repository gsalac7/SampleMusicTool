export const sampleSequences = {
    majorScaleUp: {
        ticksPerQuarter: 220,
        totalTime: 8, // Adjusted to reflect the increased number of steps
        timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
        tempos: [{ time: 0, qpm: 120 }],
        notes: [
            { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4 }, // C4
            { pitch: 62, quantizedStartStep: 4, quantizedEndStep: 8 }, // D4
            { pitch: 64, quantizedStartStep: 8, quantizedEndStep: 12 }, // E4
            { pitch: 65, quantizedStartStep: 12, quantizedEndStep: 16 }, // F4
            { pitch: 67, quantizedStartStep: 16, quantizedEndStep: 20 }, // G4
            { pitch: 69, quantizedStartStep: 20, quantizedEndStep: 24 }, // A4
            { pitch: 71, quantizedStartStep: 24, quantizedEndStep: 28 }, // B4
            { pitch: 72, quantizedStartStep: 28, quantizedEndStep: 32 }, // C5
        ],
        quantizationInfo: { stepsPerQuarter: 4 }
    },
    complexMelody: {
        ticksPerQuarter: 220,
        totalTime: 16, // Reflecting the longer sequence
        timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
        tempos: [{ time: 0, qpm: 120 }],
        notes: [
            { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 6 }, // C4
            { pitch: 62, quantizedStartStep: 6, quantizedEndStep: 12 }, // D4
            { pitch: 64, quantizedStartStep: 12, quantizedEndStep: 18 }, // E4
            { pitch: 65, quantizedStartStep: 18, quantizedEndStep: 24 }, // F4
            { pitch: 67, quantizedStartStep: 24, quantizedEndStep: 30 }, // G4
            { pitch: 69, quantizedStartStep: 30, quantizedEndStep: 36 }, // A4
            { pitch: 71, quantizedStartStep: 36, quantizedEndStep: 42 }, // B4
            { pitch: 72, quantizedStartStep: 42, quantizedEndStep: 48 }, // C5
            { pitch: 74, quantizedStartStep: 48, quantizedEndStep: 52 }, // D5
            { pitch: 76, quantizedStartStep: 52, quantizedEndStep: 56 }, // E5
            { pitch: 77, quantizedStartStep: 56, quantizedEndStep: 60 }, // F5
            { pitch: 79, quantizedStartStep: 60, quantizedEndStep: 64 }, // G5
        ],
        quantizationInfo: { stepsPerQuarter: 4 }
    }
};
