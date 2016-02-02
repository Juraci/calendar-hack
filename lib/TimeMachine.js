var TimeMachine = function(time) {
    this.time = time;
};

TimeMachine.prototype.twentyFourHoursFormat =  function() {
    return this.time.match(/[0-9][0-9]\:[0-9][0-9]$/) !== null;
};

TimeMachine.prototype.twelveHoursFormat = function() {
    return this.time.match(/\d+\:[0-9][0-9](?:am|pm)$/) !== null;
};

module.exports = TimeMachine;
