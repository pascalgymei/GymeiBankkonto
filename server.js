"use strict"
var http = require('http');
var url = require('url');
var fs = require('fs');
var Server = require('socket.io');
var io = new Server(http, { pingInterval: 5000, pingTimeout: 10000 });
var LOGGED_IPS = [];

var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}

//Enums
var Type = {
    LOGIN: 0,
    LOGINB: 1
};

function getIp(socket) {
    return (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address || '127.0.0.1');
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
    console.log("request received from: " + req.connection.remoteAddress);
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
                        LOGGED_IPS.push(ip);
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
            return "Ihre Auszahlungsanfrage von " + BETRAG + " übersteigt ihren maximalen Kredit von -" + this.__NEGATIV + "€, da ihr Kontostand bei " + this.__KONTOSTAND + "€ liegt!";
        }
        else {
            this.__KONTOSTAND -= BETRAG;
            this.__AUSZUG += "\nEs wurden " + BETRAG + "€ von ihrem Konto abgebucht.";
            return "Ihr Betrag von " + BETRAG + "€ wurde erfolgreich abgebucht.";
        }
    }
    einzahlen_func(BETRAG) {
        this.__KONTOSTAND += BETRAG;
        this.__AUSZUG += "\nEs wurden " + BETRAG + "€ zu ihrem Konto aufgebucht.";
        return "Ihr Betrag von " + BETRAG + "€ wurde erfolgreich aufgebucht.";
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
            return "Ihre Überweisung von " + BETRAG + " übersteigt ihren maximalen Kredit von -" + this.__NEGATIV + "€, da ihr Kontostand bei " + this.__KONTOSTAND + "€ liegt!";
        }
        else {
            var KONTOTO = IBAN_LIST[IBAN];
            if (KONTOTO) {
                this.__KONTOSTAND -= BETRAG;
                KONTOTO.__KONTOSTAND += BETRAG;
                this.__AUSZUG += "\nEs wurden " + BETRAG + "€ zu " + KONTOTO.__IBAN + " überwiesen.";
                KONTOTO.__AUSZUG += "\nEs wurden " + BETRAG + "€ von " + this.__IBAN + " auf ihr Konto überwiesen.";
                return BETRAG + "€ wurden erfolgreich überwiesen.";
            }
            else {
                return IBAN + " ist keine gültige IBAN!";
            }
        }
    }
};

var BK1 = new Bankkonto("DE89370400440532013000", 1000, 0.5, "Girokonto", -100, "ABC");
var BK2 = new Bankkonto("DE42187384985716759572", 500, 0.4, "Girokonto", -200, "DEF")
var IBAN_LIST = new Array();
IBAN_LIST[BK1.abrufen_func("IBAN")] = BK1;
IBAN_LIST[BK2.abrufen_func("IBAN")] = BK2;
