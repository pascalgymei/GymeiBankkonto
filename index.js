//Enums
var Type = {
    LOGIN: 0
};

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
                $('#error').html('Eine IBAN darf nur Buchstaben von A-Z und Zahlen enthalten.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'empty') {
                $('#error').html('Bitte eine IBAN eingeben.');
                $('#error').css('display', 'block');
                $('#send').attr('disabled', 'disabled');
            }
            else if (result == 'not22') {
                $('#error').html('Eine IBAN besteht aus 22 Ziffern. Bitte überprüfen sie dies.');
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
function logiban() {
    var iban_element = document.getElementById('iban');
    var password_element = document.getElementById('password');

    var iban = iban_element.value.trim();
    var password = password_element.value.trim();

    socket.emit(Type.LOGIN, iban, password);
}