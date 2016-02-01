var TimeMachine = function(time) {
    this.time = time;
};

TimeMachine.prototype.twentyFourHoursFormat =  function() {
        return !this.time.includes('am') && !this.time.includes('pm');
};

module.exports = TimeMachine;
