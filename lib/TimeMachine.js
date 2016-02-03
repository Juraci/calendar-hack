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

module.exports = TimeMachine;
