//Enums
var Type = {
    TEST: 0
};

var socket = io.connect({ 'pingInterval': 45000 });

function testFunction() {
    socket.emit(Type.TEST);
}