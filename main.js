(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/TimeMachine":2,"./lib/blur":3,"./lib/calendar":4,"./lib/highlight":5,"./lib/spinnerHandler":7}],2:[function(require,module,exports){
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

module.exports = TimeMachine;

},{}],3:[function(require,module,exports){
const BLUR = (function(doc){
  const blur = 'blur(3px)';
  const noBlur = 'blur(0px)';

  return {
    add: () => {
      let element = doc.querySelector('#calmaster');
      element.style.filter = blur;
    },
    remove: () => {
      let element = doc.querySelector('#calmaster');
      element.style.filter = noBlur;
    }
  };
})(document);

module.exports = BLUR;

},{}],4:[function(require,module,exports){
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

},{"./mouse":6}],5:[function(require,module,exports){
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

module.exports = HIGHLIGHT;

},{}],6:[function(require,module,exports){
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

module.exports = MOUSE;

},{}],7:[function(require,module,exports){
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

},{"spin.js":8}],8:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */
;(function (root, factory) {

  /* CommonJS */
  if (typeof module == 'object' && module.exports) module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}(this, function () {
  "use strict"

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */
    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl (tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for (n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins (parent /* child1, child2, ...*/) {
    for (var i = 1, n = arguments.length; i < n; i++) {
      parent.appendChild(arguments[i])
    }

    return parent
  }

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation (alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor (el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    if (s[prop] !== undefined) return prop
    for (i = 0; i < prefixes.length; i++) {
      pp = prefixes[i]+prop
      if (s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css (el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n) || n] = prop[n]
    }

    return el
  }

  /**
   * Fills in default values.
   */
  function merge (obj) {
    for (var i = 1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n]
      }
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor (color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12             // The number of lines to draw
  , length: 7             // The length of each line
  , width: 5              // The line thickness
  , radius: 10            // The radius of the inner circle
  , scale: 1.0            // Scales overall size of the spinner
  , corners: 1            // Roundness (0..1)
  , color: '#000'         // #rgb or #rrggbb
  , opacity: 1/4          // Opacity of the lines
  , rotate: 0             // Rotation offset
  , direction: 1          // 1: clockwise, -1: counterclockwise
  , speed: 1              // Rounds per second
  , trail: 100            // Afterglow percentage
  , fps: 20               // Frames per second when using setTimeout()
  , zIndex: 2e9           // Use a high z-index by default
  , className: 'spinner'  // CSS class to assign to the element
  , top: '50%'            // center vertically
  , left: '50%'           // center horizontally
  , shadow: false         // Whether to render a shadow
  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
  , position: 'absolute'  // Element positioning
  }

  /** The constructor */
  function Spinner (o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function (target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = createEl(null, {className: o.className})

      css(el, {
        position: o.position
      , width: 0
      , zIndex: o.zIndex
      , left: o.left
      , top: o.top
      })

      if (target) {
        target.insertBefore(el, target.firstChild || null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps / o.speed
          , ostep = (1 - o.opacity) / (f * o.trail / 100)
          , astep = f / o.lines

        ;(function anim () {
          i++
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
        })()
      }
      return self
    }

    /**
     * Stops and removes the Spinner.
     */
  , stop: function () {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    }

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
  , lines: function (el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill (color, shadow) {
        return css(createEl(), {
          position: 'absolute'
        , width: o.scale * (o.length + o.width) + 'px'
        , height: o.scale * o.width + 'px'
        , background: color
        , boxShadow: shadow
        , transformOrigin: 'left'
        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute'
        , top: 1 + ~(o.scale * o.width / 2) + 'px'
        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
        , opacity: o.opacity
        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    }

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
  , opacity: function (el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML () {

    /* Utility function to create a VML tag */
    function vml (tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function (el, o) {
      var r = o.scale * (o.length + o.width)
        , s = o.scale * 2 * r

      function grp () {
        return css(
          vml('group', {
            coordsize: s + ' ' + s
          , coordorigin: -r + ' ' + -r
          })
        , { width: s, height: s }
        )
      }

      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg (i, dx, filter) {
        ins(
          g
        , ins(
            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
          , ins(
              css(
                vml('roundrect', {arcsize: o.corners})
              , { width: r
                , height: o.scale * o.width
                , left: o.scale * o.radius
                , top: -o.scale * o.width >> 1
                , filter: filter
                }
              )
            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++) {
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
        }

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function (el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i + o < c.childNodes.length) {
        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  if (typeof document !== 'undefined') {
    sheet = (function () {
      var el = createEl('style', {type : 'text/css'})
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')
  }

  return Spinner

}));

},{}]},{},[1]);
