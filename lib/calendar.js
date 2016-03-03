var MOUSE = require('./mouse');

var CALENDAR = (function(mouse) {
    var startTimeSelector = 'input[id*="st"][class*="dr-time"]';
    var endTimeSelector = 'input[id*="et"][class*="dr-time"]';
    var roomsTabSelector = '#ui-ltsr-tab-1';
    var hoursSelector = 'div.goog-control';
    var countriesSelector = 'div.ch';
    var zippySelector = 'div[class*="ch-zippy-exp"]';
    var officeSelector = 'div.ci[style*="background-image"][style*="res_a.gif"]';
    var addOfficeSelector = '.conf-action';
    var locationFieldSelector = 'input.textinput[aria-labelledby*="location-label"]';

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

        for(var i = 0, hoursLength = hours.length, regex = ''; i < hoursLength; i++) {
            sanitizedTime = sanitizeTime(hours[i].textContent);
            regex = new RegExp('^'+ time + '$');
            if (sanitizedTime.match(regex) !== null) {
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
        },
        getAvailableOffices: function() {
            return document.querySelectorAll(officeSelector);
        },
        addOffice: function(office) {
            office.querySelector(addOfficeSelector).click();
        },
        getLocationField: function() {
            return document.querySelector(locationFieldSelector);
        },
        getSampleTime: function() {
            mouse.click(startTimeElement());
            return hourElements()[0].textContent;
        }
    };

})(MOUSE);

module.exports = CALENDAR;