'use strict';

(function () {
const
    path = require('path'),
    request = require('request'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'crier';


// Expressjs web server
var web = null;
    
function Crier (Web) {
    web = Web;
}

Crier.prototype.relayQueenCommandToNinja = function relayQueenCommandToNinja(boss, cb) {
    var results = [boss.name + ' relay Her Majesty command to ninja'];
    request({
        url: web.cfg.kingdom.website + '/queen/commands/ninja/startMachines',
        method: 'POST',
        json: {kingdom: web.cfg.kingdom}},
        function (err, response, body) { 
            if (err) cb(err); 
            else {
                results.push(body);
                cb(null, results);
            }
        }
    );
};

Crier.prototype.relayQueenCommandToPirate = function relayQueenCommandToPirate(boss, cb) {
    var results = [boss.name + ' relay Her Majesty command to pirate'];
    request({
        url: web.cfg.kingdom.website + '/queen/commands/pirate/startMachines',
        method: 'POST',
        json: {kingdom: web.cfg.kingdom}},
        function (err, response, body) { 
            if (err) cb(err); 
            else {
                results.push(body);
                cb(null, results);
            }
        }
    );
};

Crier.prototype.gearWebsockets = function gearWebsockets(boss, cb) {
    web.ios.on('connection', (socket) => {
        var crier = web.minion.crier;

        /// #### Standard Messages
        socket.on('disconnect', () => {console.log('onDisconnect: ' + socket.id);});

        /// #### Crier Minion Messages
        socket.on('Watch', (message) => {crier.onWatch(socket, message);});
        socket.on('Unwatch', (message) => {crier.onUnwatch(socket, message);});

        // - Send a 'Connected' message back to the client
        crier.emitConnected(socket);
    });
    cb(null);
};

/// - Got Watch request
Crier.prototype.onWatch = function onWatch(socket, msg) {
    if (msg.resource) {
        socket.join(msg.resource);
        console.log('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
    }
    else {
        console.log('onWatch: ' + socket.id + ' resource to join was not specified');
    }
};

/// - Got Unwatch request
Crier.prototype.onUnwatch = function onUnwatch(socket, msg) {
    if (msg.resource) {
        socket.leave(msg.resource);
        console.log('onUnwatch: ' + socket.id + ' left resource - ' + msg.resource);
    }
    else {
        console.log('onUnwatch: ' + socket.id + ' resource to leave was not specified ');
    }
};

/// #### Standard Events
Crier.prototype.emitConnected = function emitConnected(socket) {
    // Send connected
    socket.emit('Connected', web.minion.angel.prayer('/', {},'/',null,null));
};


module.exports = Crier;

})();