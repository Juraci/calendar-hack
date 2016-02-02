describe('TimeMachine', function() {
    var TimeMachine = require('../lib/TimeMachine.js');

    describe('#twentyFourHoursFormat', function() {
        it('returns true to 17:00', function() {
            var time = new TimeMachine('17:00');
            expect(time.twentyFourHoursFormat()).toBe(true);
        });

        it('returns false to 10:00am', function() {
            var time = new TimeMachine('10:00am');
            expect(time.twentyFourHoursFormat()).toBe(false);
        });

        it('returns false to 6:00pm', function() {
            var time = new TimeMachine('6:00pm');
            expect(time.twentyFourHoursFormat()).toBe(false);
        });
    });

    describe('#twelveHoursFormat', function() {
        it('returns true to 6:00pm', function() {
            var time = new TimeMachine('6:00pm');
            expect(time.twelveHoursFormat()).toBe(true);
        });

        it('returns false to 11:00', function() {
            var time = new TimeMachine('11:00');
            expect(time.twelveHoursFormat()).toBe(false);
        });
    });
});
