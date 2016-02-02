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

    describe('#getHours', function() {
        it('returns 17 when time is 17:00', function() {
            var time = new TimeMachine('17:00');
            expect(time.getHours()).toEqual(17);
        });

        it('returns 6 when time is 6:00', function() {
            var time = new TimeMachine('6:00');
            expect(time.getHours()).toEqual(6);
        });

        it('returns 0 when time is 00:00', function() {
            var time = new TimeMachine('00:00');
            expect(time.getHours()).toEqual(0);
        });
    });

    describe('#getMinutes', function() {
        it('returns 30 when time is 17:30', function() {
            var time = new TimeMachine('17:30');
            expect(time.getMinutes()).toEqual(30);
        });

        it('returns 0 when time is 6:00pm', function() {
            var time = new TimeMachine('6:00pm');
            expect(time.getMinutes()).toEqual(0);
        });
    });
});
