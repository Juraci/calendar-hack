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

var CALENDAR = (function(mouse) {
    var startTimeSelector = 'input[id*="st"][class*="dr-time"]';
    var endTimeSelector = 'input[id*="et"][class*="dr-time"]';
    var roomsTabSelector = '#ui-ltsr-tab-1';
    var hoursSelector = 'div.goog-control';
    var countriesSelector = 'div.ch';
    var zippySelector = 'div[class*="ch-zippy-exp"]';

    var startTimeElement = function() {
        return document.querySelector(startTimeSelector);
    };

    var endTimeElement = function() {
        return document.querySelector(endTimeSelector);
    };

    var roomsTabElement = function() {
        return document.querySelector(roomsTabSelector);
    };

    var roomsTabSelected = function() {
        return roomsTabElement().classList.contains('ui-ltsr-selected') ? true : false;
    };

    var hourElements = function() {
        return document.querySelectorAll(hoursSelector);
    };

    var sanitizeTime = function(str) {
        return str.replace(/ \([\d+]*\,*[\d+]* [a-z]+\)/, '');
    };

    var getCountriesList = function() {
        return document.querySelectorAll(countriesSelector);
    };

    var countryExpanded = function(countryElement) {
        return countryElement.parentElement.querySelector(zippySelector) === null;
    };

    var selectTimeOnElement = function(time, element) {
            mouse.click(element);
            var hours = hourElements();
            var sanitizedTime = '';

            for(var i = 0, hoursLength = hours.length; i < hoursLength; i++) {
                sanitizedTime = sanitizeTime(hours[i].textContent);
                if (sanitizedTime.includes(time)) {
                    mouse.click(hours[i], {dropdown: true});
                    return 'Hour selected: ' + sanitizedTime;
                }
            }

            return 'Hour not found: ' + time;
    };

    return {
        selectStartTime: function(time) {
            return selectTimeOnElement(time, startTimeElement());
        },
        selectEndTime: function(time) {
            return selectTimeOnElement(time, endTimeElement());
        },
        selectRoomsTab: function() {
            if (! roomsTabSelected()) {
                roomsTabElement().click();
                return 'Rooms tab selected';
            } else {
                return 'Rooms tab already selected';
            }
        },
        expandCountry: function(country) {
            var elements = getCountriesList();

            for(var i =  0, elementsLength = elements.length; i < elementsLength; i++) {
                if (elements[i].textContent.includes(country)) {
                    if (countryExpanded(elements[i])) {
                        elements[i].click();
                        return 'Country found: ' + country;
                    } else {
                        return 'Country already expanded: ' + country;
                    }
                }
            }
            return 'Country ' + country + ' not found';
        }
    };

})(MOUSE);

function findRoomInOffice(query) {
    var tries = 0;
    var maxTries = 10;

    var id = setInterval(function(){
        console.log('looking for offices');
        var offices = document.querySelectorAll('div.ci[style*="background-image"][style*="res_a.gif"]');

        for(var i = 0, officesLength = offices.length; i < officesLength; i++) {
            console.log('Checking office: ' + offices[i].textContent);
            if(offices[i].textContent.includes(query)) {
                console.log('Room found ' + query);
                offices[i].querySelector('.conf-action').click();
                clearInterval(id);
                break;
            }
        }

        tries++;
        if (tries >= maxTries) {
            console.log('Could not find a room in the office in %s tries, aborting.', tries);
            clearInterval(id);
        }
    }, 800);
}

console.log(CALENDAR.selectStartTime('16:30'));
console.log(CALENDAR.selectEndTime('17:30'));
console.log(CALENDAR.selectRoomsTab());
console.log(CALENDAR.expandCountry('Brazil'));
findRoomInOffice('POA');
