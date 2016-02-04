var TimeMachine = function(time) {
    this.time = time;
    if(!this.twentyFourHoursFormat() && !this.twelveHoursFormat()) {
        throw(new Error('time format ' + time + ' not recognized'));
    }
};

TimeMachine.prototype.twentyFourHoursFormat =  function() {
    return this.time.match(/[0-9][0-9]\:[0-9][0-9]$/) !== null;
};

TimeMachine.prototype.twelveHoursFormat = function() {
    return this.time.match(/\d+\:[0-9][0-9](?:am|pm)$/) !== null;
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
        this.time = hours + ':' + minutes;
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
        this.time = hours + ':' + minutes + extension;
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
        this.time = hours + ':' + minutes;
    } else {
        var extension = this.getExtension();
        if(minutes < 30) {
            minutes += 30;
            this.time = hours + ':' + minutes + extension;
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
            this.time = hours + ':' + minutes + extension;
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

    this.time = hours + ':' + minutes;
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
