//Enums
var Type = {
    TEST1: 0,
    TEST2: 1
};

var socket = io.connect({ 'pingInterval': 45000 });

function testFunktion() {
    socket.emit(Type.TEST1);
}
socket.on(Type.TEST2, function () {
    document.getElementById("test").innerHTML = "YAY";
});