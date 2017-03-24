'use strict';

(function (){

const
    url = require('url'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = require('path').basename(__filename).replace('.js', '');

// Temporary until I get the hostname from config done!!!!
var hostname = process.env.C9_HOSTNAME;

// Express web server and boss for this minion
var web = null, boss = null;

module.exports = {

gear: function(myWeb) {web = myWeb; boss = myWeb.boss;},
    
// Prayer is the payload for REST and/or Websocket responses
prayer:  function prayer(minionname, resource, data, location, status, error) {
    return {
        boss: boss,
        minion: minionname,
        resource: resource,
        data: data ? data : null,
        location: decodeURI(location),
        status: status ? status : {code: 200, text: '200 - OK'},
        error: error ? error : null };
    },

/// Get the absolute url of the request
///    ie: https://host/path?querystring#hash part from the url
/// Indicates socket.io by setting protocol and host to https://socketio
getNodejsURL: function getNodejsURL(req, res, next) {
    // When request is a string is from socket.io
    if (typeof req.resource === 'string') {
        return url.parse('https://' + hostname + req.resource, true);
    }

    // Is a RESTful (express) request
    return url.parse(req.protocol + 's://' + req.get('host') + req.originalUrl);
},


/// - Get request
onGet: function onGet(socket, msg) {
    if (msg.resource) {
        console.log('onGet: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('onGet: ' + socket.id + ' resource was not specified ');
    }
},

/// - Post request
onPost: function onPost(socket, msg) {
    if (msg.resource) {
        console.log('onPost: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('onPost: ' + socket.id + ' resource was not specified ');
    }
},


/// - Put request
onPut: function onPut(socket, msg) {
    if (msg.resource) {
        console.log('Put: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Put: ' + socket.id + ' resource was not specified ');
    }
},

/// - Patch request
onPatch: function onPatch(socket, msg) {
    if (msg.resource) {
        console.log('Patch: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Patch: ' + socket.id + ' resource was not specified ');
    }
},

/// - Delete request
onDelete: function onDelete(socket, msg) {
    if (msg.resource) {
        console.log('Delete: ' + socket.id + ' resource - ' + msg.resource);
    }
    else {
        console.log('Delete: ' + socket.id + ' resource was not specified ');
    }
},

/// - Got Watch request
onWatch: function onWatch(socket, msg) {
    if (msg.resource) {
        socket.join(msg.resource);
        console.log('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
    }
    else {
        console.log('onWatch: ' + socket.id + ' resource to join was not specified');
    }
},

/// - Got Unwatch request
onUnwatch: function onUnwatch(socket, msg) {
    if (msg.resource) {
        socket.leave(msg.resource);
        console.log('onUnwatch: ' + socket.id + ' left resource - ' + msg.resource);
    }
    else {
        console.log('onUnwatch: ' + socket.id + ' resource to leave was not specified ');
    }
},

/// #### Standard Events
emitConnected: function emitConnected(socket) {
    // Send connected
    socket.emit('Connected', prayer('/', {},'/',null,null));
}


};

})();