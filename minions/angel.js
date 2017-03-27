'use strict';

(function (){

const
    url = require('url'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'angel';

// Express web server and boss for this minion
var web = null;

function Angel (bossWeb) {
    web = bossWeb;
}

// Prayer is the payload for REST and/or Websocket responses
Angel.prototype.invokePrayer = function invokePrayer(req, res, next) {
    var fullUrl = web.minion.angel.getNodejsURL(req, res, next);
    var path = fullUrl.pathname.split('/');
    // Remove the '/boss/minion/' part - what is left references the object in the DB
    var resource = '/' + fullUrl.pathname.split('/').slice(4).join('/');
    // Send the prayer to the requester
    return {
        bossName: path[1],
        minionName: path[2],
        resource: resource,
        data: null,
        location: decodeURI(fullUrl.href),
        status: {code: 200, text: '200 - OK'},
        error: null
    };
},

/// Get the absolute url of the request
///    ie: https://host/path?querystring#hash part from the url
/// Indicates socket.io by setting protocol and host to https://socketio
Angel.prototype.getNodejsURL = function getNodejsURL(req, res, next) {
    // When request is a string is from socket.io
    if (typeof req.resource === 'string') {
        return url.parse('https://' + hostname + req.resource, true);
    }

    // Is a RESTful (express) request
    return url.parse(req.protocol + 's://' + req.get('host') + req.originalUrl);
};


/// - Get request
Angel.prototype.onGet = function onGet(socket, msg) {
    if (msg.resource) {
        console.log('onGet: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('onGet: ' + socket.id + ' resource was not specified ');
    }
};

/// - Post request
Angel.prototype.onPost = function onPost(socket, msg) {
    if (msg.resource) {
        console.log('onPost: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('onPost: ' + socket.id + ' resource was not specified ');
    }
};


/// - Put request
Angel.prototype.onPut = function onPut(socket, msg) {
    if (msg.resource) {
        console.log('Put: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Put: ' + socket.id + ' resource was not specified ');
    }
};

/// - Patch request
Angel.prototype.onPatch = function onPatch(socket, msg) {
    if (msg.resource) {
        console.log('Patch: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Patch: ' + socket.id + ' resource was not specified ');
    }
};

/// - Delete request
Angel.prototype.onDelete = function onDelete(socket, msg) {
    if (msg.resource) {
        console.log('Delete: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Delete: ' + socket.id + ' resource was not specified ');
    }
};

/// - Got Watch request
Angel.prototype.onWatch = function onWatch(socket, msg) {
    if (msg.resource) {
        socket.join(msg.resource);
        console.log('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
    }
    else {
        console.log('onWatch: ' + socket.id + ' resource to join was not specified');
    }
};

/// - Got Unwatch request
Angel.prototype.onUnwatch = function onUnwatch(socket, msg) {
    if (msg.resource) {
        socket.leave(msg.resource);
        console.log('onUnwatch: ' + socket.id + ' left resource - ' + msg.resource);
    }
    else {
        console.log('onUnwatch: ' + socket.id + ' resource to leave was not specified ');
    }
};

/// #### Standard Events
Angel.prototype.emitConnected = function emitConnected(socket) {
    // Send connected
    socket.emit('Connected', Angel.prayer('/', {},'/',null,null));
};

module.exports = Angel;


})();