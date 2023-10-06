import Nexus from 'nexusui';

let bpmDial;

function initializeBpmDial() {
    bpmDial = new Nexus.Dial('#bpmDial', {
        'size': [75, 75],
        'interaction': 'radial', // "radial", "vertical", or "horizontal"
        'mode': 'relative', // "absolute" or "relative"
        'min': 0,
        'max': 200,
        'step': 1,
        'value': 120
    });

    bpmDial.colorize("accent", "#ff0000"); // You can change color to match your aesthetic
    bpmDial.colorize("fill", "#333"); // Adjust as needed

    bpmDial.on('change', function (v) {
        // When the value changes, you can use v to set your BPM
        console.log(v); // This logs the current value of the dial
        return v
        // You can use this value to adjust the BPM of your sequencer
    });
    // Call this function when your page is loaded
    document.addEventListener('DOMContentLoaded', initializeBpmDial);
}

export { initializeBpmDial };