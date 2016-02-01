describe('TimeMachine', function() {
    var TimeMachine = require('../lib/TimeMachine.js');

    it('detects the twenty four hours format', function() {
        var time = new TimeMachine('10:00');
        expect(time.twentyFourHoursFormat()).toBe(true);
    });

    it('10:00am should not be detected as twenty four hours format', function() {
        var time = new TimeMachine('10:00am');
        expect(time.twentyFourHoursFormat()).toBe(false);
    });

    it('6:00pm should not be detected as twenty four hours format', function() {
        var time = new TimeMachine('6:00pm');
        expect(time.twentyFourHoursFormat()).toBe(false);
    });
});
