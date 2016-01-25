var startTime = document.querySelector('input[id*="st"][class*="dr-time"]');
var endTime = document.querySelector('input[id*="et"][class*="dr-time"]');

function simulateClick(element) {
    var options = { bubbles: true, cancelable: true, view: window  };
    var mouseUpEvent = new MouseEvent('mousedown',  options);
    var mouseDownEvent = new MouseEvent('mouseup', options);

    element.dispatchEvent(mouseDownEvent);
    element.dispatchEvent(mouseUpEvent);
    element.dispatchEvent(mouseDownEvent);
}

var rooms = document.querySelector('#ui-ltsr-tab-1');
rooms.click();

function clickOnCountry(country) {
    var elements = document.querySelectorAll('div.ch');
    for(var i =  0; i < elements.length; i++) {
        if (elements[i].textContent.includes(country)) {
            elements[i].click();
            return 'ok';
        }

    }
    return 'Country ' + country + ' not found';
}

function findRoomInOffice(query) {

    var offices = [];

    var id = setInterval(function(){
        if (offices.length === 0) {
            console.log('looking for offices');
            offices = document.querySelectorAll('div.ci[style*="background-image"][style*="res_a.gif"]');
            if (offices.length > 0) {
                console.log('Offices found');
                for(var i = 0; i < offices.length; i++) {
                    if(offices[i].textContent.includes(query)) {
                        console.log('Query found ' + query);
                        offices[i].querySelector('.conf-action').click();
                    }
                }
            }

        } else {
            console.log('clear the intervalcheck');

        }

    }, 1000);

}
