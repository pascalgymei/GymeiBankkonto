"use strict"
var http = require('http');
var url = require('url');
var fs = require('fs');
var Server = require('socket.io');
var io = new Server(http, { pingInterval: 5000, pingTimeout: 10000 });

var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}

//Enums
var Type = {
    LOGIN: 0,
    LOGINB: 1,
    BKI: 2,
    BKO: 3
};

function getIp(socket) {
    return (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address || '127.0.0.1');
}
function getIpReq(req) {
    return (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
}

function validateIBAN(iban) {
    var newIban = iban.toUpperCase(),
        modulo = function (divident, divisor) {
            var cDivident = '';
            var cRest = '';

            for (var i in divident) {
                var cChar = divident[i];
                var cOperator = cRest + '' + cDivident + '' + cChar;

                if (cOperator < parseInt(divisor)) {
                    cDivident += '' + cChar;
                } else {
                    cRest = cOperator % divisor;
                    if (cRest == 0) {
                        cRest = '';
                    }
                    cDivident = '';
                }

            }
            cRest += '' + cDivident;
            if (cRest == '') {
                cRest = 0;
            }
            return cRest;
        };

    if (newIban.search(/^[A-Z]{2}/gi) < 0) {
        return false;
    }

    newIban = newIban.substring(4) + newIban.substring(0, 4);

    newIban = newIban.replace(/[A-Z]/g, function (match) {
        return match.charCodeAt(0) - 55;
    });

    return parseInt(modulo(newIban, 97), 10) === 1;
}

var server = http.createServer(function(req,res)
{
    var path = url.parse(req.url).pathname;
    //Routing
    switch (path)
    {
        case '/':
                fs.readFile(__dirname + '/index.html', function(error, data){
                    if (error){
                        res.writeHead(404);
                        res.write("<h1>Oops! This page doesn\'t seem to exist! 404</h1>");
                        res.end();
                    }
                    else{
                        res.writeHead(200, {"Content-Type": "text/html"});
                        res.write(data, "utf8");
                        res.end();
                    }
                });
        break;
        case '/jquery-2.1.4.min.js':
        case '/index.js':
        case '/main.js':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    res.writeHead(404);
                    res.write("<h1>Oops! This page doesn\'t seem to exist! 404</h1>");
                    res.end();
                }
                else{
                    res.writeHead(200, {"Content-Type": "text/js"});
                    res.write(data, "utf8");
                    res.end();
                }
            });
        break;
        case '/ibancheck':
            var iban = url.parse(req.url).query;
            if (iban && typeof iban == 'string') {
                res.writeHead(200, { "Content-Type": "text/plain" });
                if (iban.length == 0) {
                    res.write('empty');
                }
                else if (iban.toLowerCase() == 'eineiban' || iban == 'eine IBAN') {
                    res.write('lol');
                }
                else if (/^[a-z0-9-_]+$/i.test(iban)) {
                    res.write('good');
                }
                else {
                    res.write('invalid');
                }
            }
            else {
                res.write('empty');
            }
            res.end();
        break;
        case '/passwordcheck':
            var password = url.parse(req.url).query;
            if (password && typeof password == 'string') {
                res.writeHead(200, { "Content-Type": "text/plain" });
                if (password.length == 0) {
                    res.write('empty');
                }
                else if (password.toLowerCase() == 'leer') {
                    res.write('lol');
                }
                else if (password.length > 20) {
                    res.write('toolong');
                }
                else if (/^[a-z0-9-_]+$/i.test(password)) {
                    res.write('good');
                }
                else {
                    res.write('invalid');
                }
            }
            else {
                res.write('empty');
            }
            res.end();
            break;
        case '/main':
            fs.readFile(__dirname + path + '.html', function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write("<h1>Oops! This page doesn\'t seem to exist! 404</h1>");
                    res.end();
                }
                else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(data, "utf8");
                    res.end();
                }
            });
            break;
        case '/index.css':
        case '/main.css':
            fs.readFile(__dirname + path, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write("<h1>Oops! This page doesn\'t seem to exist! 404</h1>");
                    res.end();
                }
                else {
                    res.writeHead(200, { "Content-Type": "text/css" });
                    res.write(data, "utf8");
                    res.end();
                }
            });
        break;
        default:
            res.writeHead(404);
            res.write('<h1>Oops! This page doesn\'t seem to exist! 404</h1>');
            res.end();
        break;
    }
});
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('Listening on port ' + port + '...');
});

io.listen(server);
io.on('connection', function (socket) {
    var ip = getIp(socket);
    socket.on(Type.LOGIN, function (iban, password) {
        var konto = IBAN_LIST[iban];
        if (validateIBAN(iban)) {
            if (konto) {
                var passwort = konto.abrufen_func("Passwort");
                if (password != "") {
                    if (passwort == password) {
                        socket.emit(Type.LOGINB, 'success', iban)
                    }
                    else {
                        socket.emit(Type.LOGINB, 'passwort2', '')
                    }
                }
                else {
                    socket.emit(Type.LOGINB, 'passwort1', '');
                }
            }
            else {
                socket.emit(Type.LOGINB, 'iban2', iban);
            }
        }
        else {
            socket.emit(Type.LOGINB, 'iban1', '');
        }
    });
    socket.on(Type.BKI, function (type,iban,value1,value2) {
        switch (type) {
            case 'einzahlen':
                var konto = IBAN_LIST[iban];
                var result = konto.einzahlen_func(value1);
                socket.emit(Type.BKO, 'einzahlen', iban, result, value1, '');
                break;
            case 'auszahlen':
                var konto = IBAN_LIST[iban];
                var result = konto.auszahlen_func(value1);
                socket.emit(Type.BKO, 'auszahlen', iban, result, value1, '');
                break;
            case 'kabrufen':
                var konto = IBAN_LIST[iban];
                var result = konto.abrufen_func("Kontostand");
                socket.emit(Type.BKO, 'kabrufen', iban, result, '', '');
                break;
            case 'ueberweisen':
                var konto = IBAN_LIST[iban];
                var result = konto.ueberweisen_func(value2, value1);
                socket.emit(Type.BKO, 'ueberweisen', iban, result, value1, value2);
                break;
        }
    });
});

class Bankkonto {
    constructor(IBAN, KONTOSTAND, ZINSEN, KONTOTYP, NEGATIV, PASSWORT) {
        this.__IBAN = IBAN;
        this.__KONTOSTAND = KONTOSTAND;
        this.__ZINSEN = ZINSEN;
        this.__KONTOTYP = KONTOTYP;
        this.__NEGATIV = NEGATIV;
        this.__PASSWORT = PASSWORT;
        this.__AUSZUG = "Dies hat sich seit ihrem letzten Besuch bei uns auf ihrem Konto getan:";
    }

    auszahlen_func(BETRAG) {
        if (this.__KONTOSTAND - BETRAG < this.__NEGATIV) {
            return "credreach";
        }
        else {
            this.__KONTOSTAND -= BETRAG;
            this.__AUSZUG += "\nEs wurden " + BETRAG + "€ von ihrem Konto abgebucht.";
            return "success";
        }
    }
    einzahlen_func(BETRAG) {
        this.__KONTOSTAND = parseInt(this.__KONTOSTAND) + parseInt(BETRAG);
        this.__AUSZUG += "\nEs wurden " + BETRAG + "€ zu ihrem Konto aufgebucht.";
        return true;
    }
    abrufen_func(TYP) {
        if (TYP == "Kontostand") {
            return this.__KONTOSTAND;
        }
        else if (TYP == "IBAN") {
            return this.__IBAN;
        }
        else if (TYP == "Passwort") {
            return this.__PASSWORT;
        }
        else if (TYP == "Auszug") {
            if (this.__AUSZUG == "Dies hat sich seit ihrem letzten Besuch bei uns auf ihrem Konto getan:") {
                return "Seit ihrem letzten Besuch bei uns hat sich nichts an ihrem Konto geändert.";
            }
            else {
                this.__AUSZUG += "\n\nIhr Kontostand liegt bei " + this.__KONTOSTAND + "€"
                var Auszugout = this.__AUSZUG;
                this.__AUSZUG = "Dies hat sich seit ihrem letzten Besuch bei uns auf ihrem Konto getan:";
                return Auszugout;
            }
        }
    }
    ueberweisen_func(IBAN, BETRAG) {
        if (this.__KONTOSTAND - BETRAG < this.__NEGATIV) {
            return "credreach";
        }
        else {
            var KONTOTO = IBAN_LIST[IBAN];
            if (KONTOTO) {
                this.__KONTOSTAND -= BETRAG;
                KONTOTO.__KONTOSTAND = parseInt(KONTOTO.__KONTOSTAND) + parseInt(BETRAG);
                this.__AUSZUG += "\nEs wurden " + BETRAG + "€ zu " + KONTOTO.__IBAN + " überwiesen.";
                KONTOTO.__AUSZUG += "\nEs wurden " + BETRAG + "€ von " + this.__IBAN + " auf ihr Konto überwiesen.";
                return "success";
            }
            else {
                return "noiban";
            }
        }
    }
};

var BK1 = new Bankkonto("DE89370400440532013000", 500, 0.4, "Girokonto", -200, "AB");
var BK2 = new Bankkonto("DE42187384985716759572", 500, 0.4, "Girokonto", -200, "CD");
var BK3 = new Bankkonto("DE20822801607300142830", 500, 0.4, "Girokonto", -200, "EF");
var BK4 = new Bankkonto("DE87760446418145358724", 500, 0.4, "Girokonto", -200, "GH");
var BK5 = new Bankkonto("DE58552912769148615367", 500, 0.4, "Girokonto", -200, "IJ");
var BK6 = new Bankkonto("DE17274456347096603050", 500, 0.4, "Girokonto", -200, "KL");
var BK7 = new Bankkonto("DE73196740431428151665", 500, 0.4, "Girokonto", -200, "MN");
var BK8 = new Bankkonto("DE40187313439809823831", 500, 0.4, "Girokonto", -200, "OP");
var BK9 = new Bankkonto("DE54838684617785598446", 500, 0.4, "Girokonto", -200, "QR");
var BK10 = new Bankkonto("DE23097965231907149531", 500, 0.4, "Girokonto", -200, "ST");
var IBAN_LIST = new Array();
IBAN_LIST[BK1.abrufen_func("IBAN")] = BK1;
IBAN_LIST[BK2.abrufen_func("IBAN")] = BK2;
IBAN_LIST[BK3.abrufen_func("IBAN")] = BK3;
IBAN_LIST[BK4.abrufen_func("IBAN")] = BK4;
IBAN_LIST[BK5.abrufen_func("IBAN")] = BK5;
IBAN_LIST[BK6.abrufen_func("IBAN")] = BK6;
IBAN_LIST[BK7.abrufen_func("IBAN")] = BK7;
IBAN_LIST[BK8.abrufen_func("IBAN")] = BK8;
IBAN_LIST[BK9.abrufen_func("IBAN")] = BK9;
IBAN_LIST[BK10.abrufen_func("IBAN")] = BK10;