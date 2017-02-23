var MOUSE = require('./mouse');

var CALENDAR = (function(mouse, doc) {
  var startTimeSelector = 'input[id*="st"][class*="dr-time"]';
  var endTimeSelector = 'input[id*="et"][class*="dr-time"]';
  var roomsTabSelector = '#ui-ltsr-tab-1';
  var hoursSelector = 'div.goog-control';
  var countriesSelector = 'div.rp-node-header';
  var zippySelector = 'div[aria-expanded="true"]';
  var officeSelector = 'li.rp-room';
  var locationFieldSelector = 'input.textinput[aria-labelledby*="location-label"]';

  var startTimeElement = function() {
    return doc.querySelector(startTimeSelector);
  };

  var endTimeElement = function() {
    return doc.querySelector(endTimeSelector);
  };

  var roomsTabElement = function() {
    return doc.querySelector(roomsTabSelector);
  };

  var roomsTabSelected = function() {
    return roomsTabElement().classList.contains('ui-ltsr-selected') ? true : false;
  };

  var hourElements = function() {
    return doc.querySelectorAll(hoursSelector);
  };

  var sanitizeTime = function(str) {
    return str.replace(/ \([\d+]*\,*[\d+]* [a-z]+\)/, '');
  };

  var getCountriesList = function() {
    return doc.querySelectorAll(countriesSelector);
  };

  const getAvailableOffices = (countryElement) => {
    return countryElement.querySelectorAll(officeSelector);
  };

  var countryExpanded = function(countryElement) {
    return !!countryElement.parentElement.querySelector(zippySelector);
  };

  const getExpandedNode = (text) => {
    const nodeSelector = `.rp-node.expanded[data-node-id*="${text}"]`;
    const element = doc.querySelector(nodeSelector);
    if (!element) {
      throw new Error(`Node ${text} not expanded, aborting..`);
    }
    return element;
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
        console.log(`Hour selected: ' + sanitizedTime`);
        return;
      }
    }

    throw new Error(`Hour not found: ${time}`);
  };

  var isRightContext = function() {
    return !!startTimeElement();
  };

  var delay = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('tick');
        resolve();
      }, time);
    });
  };

  var waitForCountries = () => {
    return new Promise((resolve) => {
      delay(1000)
        .then(() => {
          let elements = getCountriesList();
          if (elements.length === 0) {
            return waitForCountries()
              .then(() => {
                resolve();
              });
          } else {
            resolve();
          }
        });
    });
  };

  var waitForOffices = (country, maxWaitingCicles) => {
    const element = getExpandedNode(country);
    return new Promise((resolve) => {
      delay(1000)
        .then(() => {
          maxWaitingCicles--;
          let elements = getAvailableOffices(element);
          console.log('available offices: ', elements.length);
          console.log('>> waiting cicles', maxWaitingCicles);
          if (elements.length === 0 && (maxWaitingCicles > 0)) {
            return waitForOffices(country, maxWaitingCicles)
              .then(() => {
                resolve();
              });
          } else {
            resolve();
          }
        });
    });
  };

  const expandCountry = function(country) {
    const clickableCountrySelector = `.rp-node[data-node-id*="${country}"] .rp-node-header`;
    const element = doc.querySelector(clickableCountrySelector);
    if (element) {
      console.log('Country found, expanding it: ' + country);
      element.click();
      if(countryExpanded(element)) {
        console.log(`Country ${country} expanded`);
        return delay(1000);
      } else {
        throw new Error(`Country not expanded ${country}`);
      }
    } else {
      throw new Error(`Country not found ${country}`);
    }
  };

  return {
    selectStartTime: function(time) {
      selectTimeOnElement(time, startTimeElement());
      return delay(1000);
    },
    selectEndTime: function(time) {
      selectTimeOnElement(time, endTimeElement());
      return delay(1000);
    },
    selectRoomsTab: function() {
      if (! roomsTabSelected()) {
        roomsTabElement().click();
        console.log('Rooms tab selected');
      } else {
        console.log('Rooms tab already selected');
      }
      return delay(500);
    },
    expandCountry: expandCountry,
    getAvailableOffices: getAvailableOffices,
    addOffice: function(office) {
      office.click();
    },
    getLocationField: function() {
      return doc.querySelector(locationFieldSelector);
    },
    getSampleTime: function() {
      mouse.click(startTimeElement());
      return hourElements()[0].textContent;
    },
    isRightContext: isRightContext,
    waitForCountries: waitForCountries,
    waitForOffices: waitForOffices,
    getExpandedNode: getExpandedNode
  };

})(MOUSE, document);

module.exports = CALENDAR;
