var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    io = require('socket.io')(http),
    cache = {};

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: Fuck');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'Content-type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    }
    else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }
            else {
                send404(response);
            }
        });
    }
}

//console.log(mime.lookup('server.js'));

var server = http.createServer(function (request, response) {
    var filePath = false;

    if (request.url === '/') {
        filePath = 'public/index.html';
    }
    else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});

io.on('connection', function () {
    console.log('a user connected');
});

server.listen(3000);
console.log('node js server has lanuched!');
