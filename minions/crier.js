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

Crier.prototype.gearSockets = function gearWebsockets(boss, cb) {
    web.ios.set('authorization', function (handshake, callback) {
      callback(null, true);
    });

    web.ios.on('connection', (socket) => {
        var crier = web.minion.crier;

        /// #### Standard Messages
        socket.on('disconnect', () => {console.log('onDisconnect: ' + socket.id);});
        /// #### Crier Minion Messages
        socket.on('Watch', (message) => {crier.onWatch(socket, message);});
        socket.on('Unwatch', (message) => {crier.onUnwatch(socket, message);});

        // - Send a 'Connected' message back to the client
        crier.emitConnected(socket);
        console.log('connected: ' + socket.id);
    });
    cb(null, 'Crier added Socket Topics Watch and Unwatch');
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
    var prayer = web.minion.angel.socketPrayer({resource: '/cyborg/crier'});
    prayer.data = {crier: 'connected'};
    socket.emit('Connected', prayer);
};


module.exports = Crier;

})();