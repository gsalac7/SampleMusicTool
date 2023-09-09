function drawGrid(canvas, stepsPerBeat) {
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const pixelsPerStep = width / stepsPerBeat;
    
    context.strokeStyle = '#E0E0E0'; // Gray color for the grid lines
    context.lineWidth = 1;

    for (let i = 1; i < stepsPerBeat; i++) {
        context.beginPath();
        context.moveTo(i * pixelsPerStep, 0);
        context.lineTo(i * pixelsPerStep, height);
        context.stroke();
    }
}
