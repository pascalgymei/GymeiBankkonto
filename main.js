//Enums
var Type = {
    LOGIN: 0,
    LOGINB: 1,
    BKI: 2,
    BKO: 3
};

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    var cookie = getCookie(cname);
    if (cookie != "") {
        return true;
    }
    else {
        return false;
    }
}

if (!checkCookie('IBAN')) {
    document.location.href = '/';
}

var socket = io.connect({ 'pingInterval': 45000 });

$(document).ready(function () {
    $('#useriban').html(getCookie('IBAN'));
    $('#selectOption').change(function () {
        var option = document.getElementById('selectOption').value;
        switch (option) {
            case 'Einzahlen':
                $('#betrag').css('display', 'inline');
                break;
            case 'Auszahlen':
                $('#betrag').css('display', 'inline');
                break;
            case 'Kontostand Abrufen':
                $('#betrag').css('display', 'none');
                break;
        }
    });
});

function logout() {
    document.cookie = 'IBAN' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.location.href = '/';
};

function performaction() {
    var betrag_element = document.getElementById('betrag');
    var betrag = betrag_element.value.trim();
    var option = document.getElementById('selectOption').value;
    var iban = getCookie('IBAN');
    switch (option) {
        case 'Einzahlen':
            socket.emit(Type.BKI, 'einzahlen', iban, betrag);
            break;
        case 'Auszahlen':
            socket.emit(Type.BKI, 'auszahlen', iban, betrag);
            break;
        case 'Kontostand Abrufen':
            socket.emit(Type.BKI, 'kabrufen', iban, '');
            break;
    }
};

socket.on(Type.BKO, function (type,iban,result,value) {
    switch (type) {
        case 'einzahlen':
            if (result) {
                $('#result').html(`Ihr Betrag von ${value}€ wurde erfolgreich aufgebucht!`);
            }
            else {
                $('#result').html(`Es ist ein fehler aufgetreten. Bitte überprüfen sie ihre Eingabe!`);
            }
            break;
        case 'auszahlen':
            if (result) {
                switch (result) {
                    case 'credreach':
                        $('#result').html(`Ihre Auszahlungsanfrage von ${value}€ übersteigt ihren maximalen Kredit. Bitte kontaktieren sie einen Bankangestellten für mehr Informationen über Kredite.`);
                        break;
                    case 'success':
                        $('#result').html(`Ihr Betrag von ${value}€ wurde erfolgreich abgebucht.`);
                        break;
                }
            }
            else {
                $('#result').html(`Es ist ein fehler aufgetreten. Bitte überprüfen sie ihre Eingabe!`);
            }
            break;
        case 'kabrufen':
                $('#result').html(`Ihr Kontosand liegt bei ${result}€.`);
                break;
    }
});