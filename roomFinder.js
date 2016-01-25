function clickOnRooms() {
    var rooms = document.querySelector('#ui-ltsr-tab-1');
    rooms.click();
}

function clickOnCountry(country) {
    var elements = document.querySelectorAll('div.ch');
    for(var i =  0; i < elements.length; i++) {
        if (elements[i].textContent.includes(country)) {
            elements[i].click();
            return 'Country found: ' + country;
        }

    }
    return 'Country ' + country + ' not found';
}

function findRoomInOffice(query) {
    var tries = 0;
    var maxTries = 20;

    var id = setInterval(function(){
        console.log('looking for offices');
        var offices = document.querySelectorAll('div.ci[style*="background-image"][style*="res_a.gif"]');
        if (offices.length > 0) {
            console.log('Offices found');
            for(var i = 0; i < offices.length; i++) {
                console.log('Checking office: ' + offices[i].textContent);
                if(offices[i].textContent.includes(query)) {
                    console.log('Room found ' + query);
                    offices[i].querySelector('.conf-action').click();
                    clearInterval(id);
                }
            }
        }

        tries++;
        if (tries >= maxTries) {
            console.log('Could not find the office in %s tries, aborting.', tries);
            clearInterval(id);
        }
    }, 800);
}

clickOnRooms();
console.log(clickOnCountry('Brazil'));
findRoomInOffice('POA');
