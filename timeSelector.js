var startTime = document.querySelector('input[id*="st"][class*="dr-time"]');
var endTime = document.querySelector('input[id*="et"][class*="dr-time"]');

function simulateClick(element) {
    var options = { bubbles: true, cancelable: true, view: window   };
    var mouseUpEvent = new MouseEvent('mousedown',  options);
    var mouseDownEvent = new MouseEvent('mouseup', options);

    element.dispatchEvent(mouseDownEvent);
    element.dispatchEvent(mouseUpEvent);
    element.dispatchEvent(mouseDownEvent);
}

function sanitizeTime(str) {
    return str.replace(/ \([\d+]*\,*[\d+]* [a-z]+\)/, '');
}

function selectTime(time, element) {

    simulateClick(element);
    var hours = document.querySelectorAll('div.goog-control');
    var sanitizedTime = '';

    for(var i = 0; i < hours.length; i++) {
        sanitizedTime = sanitizeTime(hours[i].textContent);
        if (sanitizedTime.includes(time)) {
            simulateClick(hours[i]);
            return 'Hour selected: ' + sanitizedTime;
        }
    }

    return 'Hour not found: ' + time;
}

console.log(selectTime('16:30', startTime));
console.log(selectTime('17:30', endTime));
