const MOUSE = require('./mouse');

const CALENDAR = (function(mouse, doc) {
  const startTimeSelector = 'input[id*="st"][class*="dr-time"]';
  const endTimeSelector = 'input[id*="et"][class*="dr-time"]';
  const roomsTabSelector = '#ui-ltsr-tab-1';
  const hoursSelector = 'div.goog-control';
  const countriesSelector = 'div.rp-node-header';
  const zippySelector = 'div[aria-expanded="true"]';
  const officeSelector = 'li.rp-room';
  const locationFieldSelector = 'input.textinput[aria-labelledby*="location-label"]';

  const startTimeElement = function() {
    return doc.querySelector(startTimeSelector);
  };

  const endTimeElement = function() {
    return doc.querySelector(endTimeSelector);
  };

  const roomsTabElement = function() {
    return doc.querySelector(roomsTabSelector);
  };

  const roomsTabSelected = function() {
    return roomsTabElement().classList.contains('ui-ltsr-selected') ? true : false;
  };

  const hourElements = function() {
    return doc.querySelectorAll(hoursSelector);
  };

  const sanitizeTime = function(str) {
    return str.replace(/ \([\d+]*\,*[\d+]* [a-z]+\)/, '');
  };

  const getCountriesList = function() {
    return doc.querySelectorAll(countriesSelector);
  };

  const getAvailableOffices = (countryElement) => {
    return countryElement.querySelectorAll(officeSelector);
  };

  const countryExpanded = function(countryElement) {
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

  const selectTimeOnElement = function(time, element) {
    mouse.click(element);
    let hours = hourElements();
    let sanitizedTime = '';

    for(let i = 0, hoursLength = hours.length, regex = ''; i < hoursLength; i++) {
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

  const isRightContext = function() {
    return !!startTimeElement();
  };

  const delay = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('tick');
        resolve();
      }, time);
    });
  };

  const waitForCountries = () => {
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

  const waitForOffices = (country, maxWaitingCicles) => {
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
