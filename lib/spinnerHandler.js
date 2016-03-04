var Spin = require('spin.js');

SPINNERHANDLER = (function(Spinner, doc){
    var spinner;
    var target;
    var running = false;

    var opts = {
        lines: 13, // The number of lines to draw
        length: 28, // The length of each line
        width: 14, // The line thickness
        radius: 84, // The radius of the inner circle
        scale: 1.50, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000', // #rgb or #rrggbb or array of colors
        opacity: 0.25, // Opacity of the lines
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: true, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        position: 'absolute' // Element positioning
    };

    try {
        spinner = new Spinner(opts);
    } catch(e) {
        console.log(e);
    }

    return {
        spin: function() {
            if(!running) {
                target = doc.querySelector('body');
                spinner.spin(target);
                running = true;
            }
        },
        stop: function() {
            spinner.stop();
            running = false;
        }
    };
})(Spin, document);

module.exports = SPINNERHANDLER;
