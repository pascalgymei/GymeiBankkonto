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
    LOGIN: 0
};

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
                else if (iban.length > 22 || iban.length < 22) {
                    res.write('not22');
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
        case '/index.css':
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
io.on('connection', function(socket){
    socket.on(Type.LOGIN, function (iban) {
        console.log(iban);
    });
});