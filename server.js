var http = require('http');
var url = require('url');
var fs = require('fs');
var Server = require('socket.io');
var io = new Server(http, { pingInterval: 5000, pingTimeout: 10000 });

var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}

var server = http.createServer(function(req,res)
{
    var path = url.parse(req.url).pathname;
    //Routing
    switch (path)
    {
        case '/':
            if (testTime && apass)
            {
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
            }
            else
            {
                res.write('<h1>Server is busy loading... Please wait a few minutes then refresh the page.</h1>');
                res.end();
            }
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