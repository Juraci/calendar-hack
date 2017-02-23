const SPINNERHANDLER = require('./lib/spinnerHandler');
const TimeMachine = require('./lib/TimeMachine');
const HIGHLIGHT = require('./lib/highlight');
const BLUR = require('./lib/blur');
const CALENDAR = require('./lib/calendar');

function findRoomInOffice(settings) {
  BLUR.add()
  SPINNERHANDLER.spin();
  settings.startTime = 'startTime' in settings ? settings.startTime : closestTimeFrame();
  settings.duration = 'duration' in settings ? settings.duration : '1';
  const unwantedMatch = settings.unwantedMatch;
  const startTime = new TimeMachine(settings.startTime);
  const endTime = new TimeMachine(settings.startTime);
  endTime.addDuration(settings.duration);
  settings['endTime'] = endTime.time;
  let selectedCountry = null;

  CALENDAR.selectStartTime(settings.startTime)
    .then(() => CALENDAR.selectEndTime(settings.endTime))
    .then(() => CALENDAR.selectRoomsTab())
    .then(() => CALENDAR.waitForCountries())
    .then(() => CALENDAR.expandCountry(settings.country))
    .then(() => CALENDAR.waitForOffices(settings.country, 10))
    .then(() => {
      console.log('>>>> done waiting for offices');
      let tries = 0;
      const maxTries = 1;

      const id = setInterval(function(){
        console.log('looking for offices');

        const element = CALENDAR.getExpandedNode(settings.country);
        const offices = CALENDAR.getAvailableOffices(element);

        for(let i = 0, officesLength = offices.length; i < officesLength; i++) {
          const textContent = offices[i].textContent;
          console.log('Checking office: ' + textContent);
          if(textContent.includes(settings.officeQuery) && doesNotMatch(unwantedMatch, textContent)) {
            console.log('Room found ' + settings.officeQuery);
            CALENDAR.addOffice(offices[i]);
            HIGHLIGHT.glow(CALENDAR.getLocationField());
            clearInterval(id);
            SPINNERHANDLER.stop();
            BLUR.remove();
            return 'done!';
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
    })
    .catch(err => console.log(err));
}

function getTimeNow(dateObject) {
  let hours = dateObject.getHours();
  let minutes = dateObject.getMinutes();

  if(minutes <= 9 && minutes >= 1) {
    minutes = '0' + minutes;
  } else if(minutes === 0) {
    minutes = '00';
  }
  return hours + ':' + minutes;
}

function closestTimeFrame() {
  let timeNow = getTimeNow(new Date());
  let sample = CALENDAR.getSampleTime();
  let time = new TimeMachine(sample);
  let finalTime;

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

if (!CALENDAR.isRightContext()) {
  alert('You need to run this inside google calendar event creation page not here!');
  return;
}

const country = prompt('Which country are you in? e.g. Brazil', 'Brazil');
if(!country) { return; }
const time = prompt('How many hours do you need? e.g. 1', '1');
if(!time) { return; }
const office = prompt('In which office are you? e.g. POA, BH, São Paulo', 'POA');
if(!office) { return; }
const startTime = prompt('Time to start looking for a room. e.g 10:00 or 10:00am', closestTimeFrame());
if(!startTime) { return; }
const unwantedStr = prompt('Type any unwanted matches like "Capacity 30" for instance', 'Capacity 30');

const settings = {
  country: country,
  duration: time,
  startTime: startTime,
  officeQuery: office,
  unwantedMatch: unwantedStr
};

findRoomInOffice(settings);
