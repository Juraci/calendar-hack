SPINNERHANDLER = (function(){
    var spinner;
    var target;
    var running = false;
    var fakeSpinner = {
        spin: function(){},
        stop: function(){}
    };

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
        spinner = fakeSpinner;
    }

    return {
        spin: function() {
            if(!running) {
                target = document.querySelector('body');
                spinner.spin(target);
                running = true;
            }
        },
        stop: function() {
            spinner.stop();
        }
    };
})();

// TimeMachine code here
var TimeMachine = function(time) {
    this.time = time;
    if(!this.twentyFourHoursFormat() && !this.twelveHoursFormat()) {
        throw(new Error('time format ' + time + ' not recognized'));
    }
};

TimeMachine.prototype.buildHours = function(hours) {
    if(hours <= 9 && hours !== '00' && this.twentyFourHoursFormat()) {
        hours = '0' + hours;
    }
    return hours;
};

TimeMachine.prototype.twentyFourHoursFormat =  function() {
    return this.time.match(/\d+\:[0-9][0-9]$/) !== null;
};

TimeMachine.prototype.twelveHoursFormat = function() {
    return this.time.match(/[1-9]*[0-9]\:[0-9][0-9](?:am|pm)$/) !== null && this.time.match(/^0[0-9]\:/) === null;
};

TimeMachine.prototype.getExtension = function() {
    if(this.twentyFourHoursFormat()) { return false; }
    return this.time.match(/am|pm/)[0];
};

TimeMachine.prototype.getHours = function() {
    return parseInt(this.time.match(/\d+/)[0]);
};

TimeMachine.prototype.getMinutes = function() {
    return parseInt(this.time.match(/\:(\d+)/)[1]);
};

TimeMachine.prototype.incrementByOneHour = function() {
    var minutes = this.getMinutes() === 0 ? '00' : this.getMinutes();
    var hours = this.getHours();

    if(this.twentyFourHoursFormat()) {
        hours++;
        this.time = this.buildHours(hours) + ':' + minutes;
    } else if(this.twelveHoursFormat()) {
        var extension = this.getExtension();

        if(hours === 12) {
            hours = 1;
        } else if(hours === 11) {
            hours++;
            extension = extension === 'pm' ? 'am' : 'pm';
        } else {
            hours++;
        }
        this.time = this.buildHours(hours) + ':' + minutes + extension;
    }
};

TimeMachine.prototype.nextTimeFrame = function() {
    var minutes = this.getMinutes();
    var hours = this.getHours();

    if(this.twentyFourHoursFormat()) {
        if(minutes < 30) {
            minutes += 30;
        } else {
            minutes = '00';
            hours++;
        }
        this.time = this.buildHours(hours) + ':' + minutes;
    } else {
        var extension = this.getExtension();
        if(minutes < 30) {
            minutes += 30;
            this.time = this.buildHours(hours) + ':' + minutes + extension;
        } else {
            minutes = '00';
            if(hours === 12) {
                hours = 1;
            } else if(hours === 11) {
                hours++;
                extension = extension === 'pm' ? 'am' : 'pm';
            } else {
                hours++;
            }
            this.time = this.buildHours(hours) + ':' + minutes + extension;
        }
    }
};

TimeMachine.prototype.addDuration = function(duration) {
    duration = parseInt(duration);

    for(var i = 0; i < duration; i++) {
        this.incrementByOneHour();
    }
};

TimeMachine.prototype.roundToTimeFrame = function() {
    var hours = this.getHours();
    var minutes = this.getMinutes();

    if(!this.twentyFourHoursFormat()) {
        throw new Error('cannot round to time frame with this format');
    }

    if(minutes < 30) {
        minutes = 30;
    } else {
        hours = hours === 23 ? '00' : hours + 1;
        minutes = '00';
    }

    this.time = this.buildHours(hours) + ':' + minutes;
};

TimeMachine.prototype.toTwelveHoursFormat = function() {
    if(this.twelveHoursFormat()) { return this.time; }

    var hours;
    var minutes = this.getMinutes() === 0 ? '00' : this.getMinutes();
    var extension = this.getHours() < 12 ? 'am' : 'pm';
    var hoursMap = { 13:1, 14:2, 15:3, 16:4, 17:5, 18:6, 19:7, 20:8, 21:9, 22:10, 23:11, 00:12 };

    if(this.getHours() <= 12) {
        hours = this.getHours();
    } else {
        hours = hoursMap[this.getHours()];
    }

    this.time = hours + ':' + minutes + extension;
};

var HIGHLIGHT = (function(){
    var boxShadow = "0 0 15px rgba(81, 250, 200, 1)";
    var border = "1px solid rgba(81, 250, 200, 1)";
    var glowCount = 0;
    var glowLimit = 3;

    return {
        glow: function(element) {
            var originalBoxShadow = element.style.boxShadow;
            var originalBorder = element.style.border;

            var id = setInterval(function(){
                glowCount++;
                element.style.boxShadow = boxShadow;
                element.style.border = border;
                setTimeout(function() {
                    element.style.boxShadow = originalBoxShadow;
                    element.style.border = originalBorder;
                }, 1000);

                if(glowCount >= glowLimit) {
                    clearInterval(id);
                }
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

function findRoomInOffice(settings) {

    settings.startTime = 'startTime' in settings ? settings.startTime : closestTimeFrame();
    settings.duration = 'duration' in settings ? settings.duration : '1';
    var startTime = new TimeMachine(settings.startTime);
    var endTime = new TimeMachine(settings.startTime);
    endTime.addDuration(settings.duration);
    settings['endTime'] = endTime.time;

    console.log(CALENDAR.selectStartTime(settings.startTime));
    console.log(CALENDAR.selectEndTime(settings.endTime));
    console.log(CALENDAR.selectRoomsTab());
    console.log(CALENDAR.expandCountry(settings.country));

    var tries = 0;
    var maxTries = 10;

    var id = setInterval(function(){
        console.log('looking for offices');
        SPINNERHANDLER.spin();
        var offices = CALENDAR.getAvailableOffices();

        for(var i = 0, officesLength = offices.length; i < officesLength; i++) {
            console.log('Checking office: ' + offices[i].textContent);
            if(offices[i].textContent.includes(settings.officeQuery)) {
                console.log('Room found ' + settings.officeQuery);
                CALENDAR.addOffice(offices[i]);
                HIGHLIGHT.glow(CALENDAR.getLocationField());
                clearInterval(id);
                SPINNERHANDLER.stop();
                break;
            }
        }

        tries++;
        if (tries >= maxTries) {
            console.log('Could not find a room in the office in %s tries, moving on 30 minutes...', tries);
            clearInterval(id);
            startTime.nextTimeFrame();
            settings.startTime = startTime.time;
            findRoomInOffice(settings);
        }
    }, 800);
}

function getTimeNow(dateObject) {
    var hours = dateObject.getHours();
    var minutes = dateObject.getMinutes();

    if(minutes <= 9 && minutes >= 1) {
        minutes = '0' + minutes;
    } else if(minutes === 0) {
        minutes = '00';
    }
    return hours + ':' + minutes;
}

function closestTimeFrame() {
    var timeNow = getTimeNow(new Date());
    var sample = CALENDAR.getSampleTime();
    var time = new TimeMachine(sample);
    var finalTime;

    finalTime = new TimeMachine(timeNow);
    finalTime.roundToTimeFrame();

    if(time.twelveHoursFormat()) {
        finalTime.toTwelveHoursFormat();
    }
    return finalTime.time;
}

var country = prompt('Which country are you? e.g. Brazil', 'Brazil');
var time = prompt('How many hours do you need? e.g. 1', '1');
var office = prompt('In which office are you? e.g. POA, BH, São Paulo', 'POA');
var startTime = prompt('Time to start looking for a room. e.g 10:00 or 10:00am', closestTimeFrame());

var settings = {
    country: country,
    duration: time,
    startTime: startTime,
    officeQuery: office
};

findRoomInOffice(settings);
