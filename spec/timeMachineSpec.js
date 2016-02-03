describe('TimeMachine', function() {
    var TimeMachine = require('../lib/TimeMachine.js');

    describe('constructor', function() {
        it('throws an error when the format is not recognized', function() {
            var error = new Error('time format 123143 not recognized');
            expect(function () {
                var time = new TimeMachine('123143');
            }).toThrow(error);
        });
    });

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

        it('returns 6 when time is 6:00pm', function() {
            var time = new TimeMachine('6:00pm');
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

        it('returns 30 when time is 10:30am', function() {
            var time = new TimeMachine('10:30pm');
            expect(time.getMinutes()).toEqual(30);
        });
    });

    describe('#getExtension', function() {
        it('returns pm when the time is 12:00pm', function() {
            var time = new TimeMachine('12:00pm');
            expect(time.getExtension()).toEqual('pm');
        });

        it('returns am when the time is 11:30am', function() {
            var time = new TimeMachine('11:30am');
            expect(time.getExtension()).toEqual('am');
        });

        it('returns false when it is a twenty four hours time format', function() {
            var time = new TimeMachine('11:30');
            expect(time.getExtension()).toBe(false);
        });
    });

    describe('#incrementByOneHour', function() {
        describe('when the format is twenty four hours', function() {
            it('sets the final time to 13:00 when the initial time is 12:00', function() {
                var time = new TimeMachine('12:00');
                time.incrementByOneHour();
                expect(time.time).toEqual('13:00');
            });
        });

        describe('when the format is twelve hours', function() {
            it('sets the final time to 1:00pm when the initial time is 12:pm', function() {
                var time = new TimeMachine('12:00pm');
                time.incrementByOneHour();
                expect(time.time).toEqual('1:00pm');
            });

            it('sets the final time to 12:30pm when the initial time is 11:30am', function() {
                var time = new TimeMachine('11:30am');
                time.incrementByOneHour();
                expect(time.time).toEqual('12:30pm');
            });

            it('sets the final time to 12:00am when the initial time is 11:00pm', function() {
                var time = new TimeMachine('11:00pm');
                time.incrementByOneHour();
                expect(time.time).toEqual('12:00am');
            });

            it('sets the final time to 3:00pm when the initial time is 2:00pm', function() {
                var time = new TimeMachine('2:00pm');
                time.incrementByOneHour();
                expect(time.time).toEqual('3:00pm');
            });
        });
    });

    describe('#nextTimeFrame', function() {
        describe('when the format is twenty four hours', function() {
            it('sets the final time to 13:30 when the time is 13:00', function() {
                var time = new TimeMachine('13:00');
                time.nextTimeFrame();
                expect(time.time).toEqual('13:30');
            });

            it('sets the final time to 14:00 when the time is 13:30', function() {
                var time = new TimeMachine('13:30');
                time.nextTimeFrame();
                expect(time.time).toEqual('14:00');
            });
        });

        describe('when the format is twelve hours', function() {
            it('sets the final time to 1:00pm when the time is 12:30pm', function() {
                var time = new TimeMachine('12:30pm');
                time.nextTimeFrame();
                expect(time.time).toEqual('1:00pm');
            });

            it('sets the final time to 12:00pm when the time is 11:30am', function() {
                var time = new TimeMachine('11:30am');
                time.nextTimeFrame();
                expect(time.time).toEqual('12:00pm');
            });

            it('sets the final time to 12:00am when the time is 11:30pm', function() {
                var time = new TimeMachine('11:30pm');
                time.nextTimeFrame();
                expect(time.time).toEqual('12:00am');
            });

            it('sets the final time to 3:00pm when the time is 2:30pm', function() {
                var time = new TimeMachine('2:30pm');
                time.nextTimeFrame();
                expect(time.time).toEqual('3:00pm');
            });

            it('sets the final time to 10:30am when the time is 10:00am', function() {
                var time = new TimeMachine('10:00am');
                time.nextTimeFrame();
                expect(time.time).toEqual('10:30am');
            });
        });
    });

    describe('#addDuration', function() {
        it('sets the final time to 18:30 when the time is 17:30 and the duration is 1h', function() {
            var time = new TimeMachine('17:30');
            time.addDuration('1');
            expect(time.time).toEqual('18:30');
        });

        it('sets the final time to 1:30pm when the time is 12:30pm and the duration is 1h', function() {
            var time = new TimeMachine('12:30pm');
            time.addDuration('1');
            expect(time.time).toEqual('1:30pm');
        });

        it('sets the final time to 12:30pm when the time is 11:30am and the duration is 1h', function() {
            var time = new TimeMachine('11:30am');
            time.addDuration('1');
            expect(time.time).toEqual('12:30pm');
        });

        it('sets the final time to 16:00 when the time is 14:00 and the duration is 2h', function() {
            var time = new TimeMachine('14:00');
            time.addDuration('2');
            expect(time.time).toEqual('16:00');
        });
    });
});
