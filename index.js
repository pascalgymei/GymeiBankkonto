//Enums
var Type = {
    TEST: 0
};

var socket = io.connect({ 'pingInterval': 45000 });

function testFunktion() {
    socket.emit(Type.TEST);
}