var HIGHLIGHT = (function(){
    var boxShadow = "0 0 15px rgba(81, 250, 200, 1)";
    var border = "1px solid rgba(81, 250, 200, 1)";

    return {
        glow: function(element) {
            var originalBoxShadow = element.style.boxShadow;
            var originalBorder = element.style.border;
            setInterval(function(){
                element.style.boxShadow = boxShadow;
                element.style.border = border;
                setTimeout(function() {
                    element.style.boxShadow = originalBoxShadow;
                    element.style.border = originalBorder;
                }, 1000);
            }, 2000);
        }
    };
})();

var MOUSE = (function() {
    var eventOptions = { bubbles: true, cancelable: true, view: window };
    var mouseUpEvent = new MouseEvent('mousedown', eventOptions);
    var mouseDownEvent = new MouseEvent('mouseup', eventOptions);

    return {
        click: function(element, options) {
            options = typeof options !== 'undefined' ? options: {};
            element.dispatchEvent(mouseDownEvent);
            element.dispatchEvent(mouseUpEvent);
            if ('dropdown' in options && options.dropdown === true) {
                element.dispatchEvent(mouseDownEvent);
            }
        }
    };
})();


function sanitizeTime(str) {
    return str.replace(/ \([\d+]*\,*[\d+]* [a-z]+\)/, '');
}

function selectTime(time, element) {

    MOUSE.click(element);
    var hours = document.querySelectorAll('div.goog-control');
    var sanitizedTime = '';

    for(var i = 0; i < hours.length; i++) {
        sanitizedTime = sanitizeTime(hours[i].textContent);
        if (sanitizedTime.includes(time)) {
            MOUSE.click(hours[i], {dropdown: true});
            return 'Hour selected: ' + sanitizedTime;
        }
    }

    return 'Hour not found: ' + time;
}

function clickOnRooms() {
    var rooms = document.querySelector('#ui-ltsr-tab-1');
    rooms.click();
}

function clickOnCountry(country) {
    var elements = document.querySelectorAll('div.ch');
    for(var i =  0; i < elements.length; i++) {
        if (elements[i].textContent.includes(country)) {
            if (elements[i].parentElement.querySelector('div[class*="ch-zippy-exp"]') === null ) {
                elements[i].click();
                return 'Country found: ' + country;
            } else {
                return 'Country already expanded: ' + country;
            }
        }

    }
    return 'Country ' + country + ' not found';
}

function findRoomInOffice(query) {
    var tries = 0;
    var maxTries = 10;

    var id = setInterval(function(){
        console.log('looking for offices');
        var offices = document.querySelectorAll('div.ci[style*="background-image"][style*="res_a.gif"]');
        if (offices.length > 0) {
            console.log('Offices found');
            for(var i = 0; i < offices.length; i++) {
                console.log('Checking office: ' + offices[i].textContent);
                if(offices[i].textContent.includes(query)) {
                    console.log('Room found ' + query);
                    offices[i].querySelector('.conf-action').click();
                    clearInterval(id);
                }
            }
        }

        tries++;
        if (tries >= maxTries) {
            console.log('Could not find a room in the office in %s tries, aborting.', tries);
            clearInterval(id);
        }
    }, 800);
}

var startTime = document.querySelector('input[id*="st"][class*="dr-time"]');
var endTime = document.querySelector('input[id*="et"][class*="dr-time"]');
HIGHLIGHT.glow(startTime);
HIGHLIGHT.glow(endTime);
console.log(selectTime('16:30', startTime));
console.log(selectTime('17:30', endTime));
clickOnRooms();
console.log(clickOnCountry('Brazil'));
findRoomInOffice('POA');
