//Enums
var Type = {
    LOGIN: 0,
    LOGINB: 1
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
    var iban = getCookie(cname);
    if (iban != "") {
        return true;
    }
    else {
        return false;
    }
}

if (checkCookie('IBAN')) {
    document.location.href = '/main';
}

var socket = io.connect({ 'pingInterval': 45000 });

$(document).ready(function () {
    $('#iban').keyup(function () {
        checkIBAN($('#iban').val());
    });
});
function checkIBAN(iban) {
    $.ajax({
        url: '/ibancheck', data: iban, success: function (result) {
            if (result == 'invalid') {
                $('#error').html('Die eingegebene IBAN ist ungültig. Bitte überprüfen sie ihre Eingabe.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'empty') {
                $('#error').html('Bitte eine IBAN eingeben.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'lol') {
                $('#error').html('Sehr witzig.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else {
                $('#error').html('');
                $('#error').css('display', 'none');
                $('#send').removeAttr('disabled');
            }
        }, error: function () {
            console.log('ERROR! Unable to make AJAX request.');
        }
    });
};
$(document).ready(function () {
    $('#password').keyup(function () {
        checkpassword($('#password').val());
    });
});
function checkpassword(password) {
    $.ajax({
        url: '/passwordcheck', data: password, success: function (result) {
            if (result == 'invalid') {
                $('#error').html('Eine Passwort darf nur Buchstaben von A-Z und Ziffern enthalten.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'empty') {
                $('#error').html('Dass Passwort darf nicht leer sein.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'toolong') {
                $('#error').html('Ein Passwort darf maximal 20 Buchstaben lang sein.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'lol') {
                $('#error').html('Sehr witzig.');
                $('#error').css('display', 'block');
            }
            else {
                $('#error').html('');
                $('#error').css('display', 'none');
                $('#send').removeAttr('disabled');
            }
        }, error: function () {
            console.log('ERROR! Unable to make AJAX request.');
        }
    });
};
function logiban() {
    var iban_element = document.getElementById('iban');
    var password_element = document.getElementById('password');

    var iban = iban_element.value.trim();
    var password = password_element.value.trim();

    socket.emit(Type.LOGIN, iban, password);
}
socket.on(Type.LOGINB, function (error, value) {
    switch (error) {
        case 'iban1':
            $('#error').html('Das Format der eingegebenen IBAN ist ungültig. Bitte überprüfen sie ihre Eingabe.');
            $('#error').css('display', 'block');
            break;
        case 'iban2':
            $('#error').html(value + ' ist keine registrierte IBAN. Bitte überprüfen sie ihre Eingabe.');
            $('#error').css('display', 'block');
            break;
        case 'passwort1':
            $('#error').html('Bitte geben sie ein Passwort ein.');
            $('#error').css('display', 'block');
            break;
        case 'passwort2':
            $('#error').html('Sie haben ein falsches Passwort eingegeben. Bitte überprüfen sie ihre Eingabe.');
            $('#error').css('display', 'block');
            break;
        case 'success':
            setCookie('IBAN', value)
            document.location.href = '/main';
            break;
    }
});