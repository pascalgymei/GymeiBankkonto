//Enums
var Type = {
    TEST1: 0
};

var socket = io.connect({ 'pingInterval': 45000 });

$(document).ready(function () {
    $('#IBAN').keyup(function () {
        checkName($('#IBAN').val());
    });
});
function checkName(name) {
    $.ajax({
        url: '/namecheck', data: name, success: function (result) {
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
                $('#error').html('Eine IBAN besteht aus 22 Ziffern. Bitte überprüfen sie diese.');
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
}
function login() {
    socket.emit(Type.TEST1);
};