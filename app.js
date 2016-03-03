var SPINNERHANDLER = require('./lib/spinnerHandler');
var TimeMachine = require('./lib/TimeMachine');
var HIGHLIGHT = require('./lib/highlight');
var CALENDAR = require('./lib/calendar');

function findRoomInOffice(settings) {

    settings.startTime = 'startTime' in settings ? settings.startTime : closestTimeFrame();
    settings.duration = 'duration' in settings ? settings.duration : '1';
    var unwantedMatch = settings.unwantedMatch;
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
            var textContent = offices[i].textContent;
            console.log('Checking office: ' + textContent);
            if(textContent.includes(settings.officeQuery) && doesNotMatch(unwantedMatch, textContent)) {
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

function doesNotMatch(unwantedStr, actualText){
    if(unwantedStr === '' || unwantedStr === null) { return true; }
    return !actualText.includes(unwantedStr);
}

var country = prompt('Which country are you? e.g. Brazil', 'Brazil');
var time = prompt('How many hours do you need? e.g. 1', '1');
var office = prompt('In which office are you? e.g. POA, BH, São Paulo', 'POA');
var startTime = prompt('Time to start looking for a room. e.g 10:00 or 10:00am', closestTimeFrame());
var unwantedStr = prompt('Type any unwanted matches like "Capacity 30" for instance', 'Capacity 30');

var settings = {
    country: country,
    duration: time,
    startTime: startTime,
    officeQuery: office,
    unwantedMatch: unwantedStr
};

findRoomInOffice(settings);
