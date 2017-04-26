'use strict';

(function () {
const
    path = require('path'),
    request = require('request'),
    alasql = require('alasql'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'crier';


// Expressjs web server
var web = null,
    chatDb = new alasql.Database();
    
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

Crier.prototype.broadcast = function broadcast(resource) {
    var prayer = web.minion.angel.socketPrayer({resource: resource});
    var path = resource.split('/'),
        sheetAlias = path[3],
        recid = path[4],
        datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
    try { // Remove the '/boss/clerk/alias' from resource to get the DB path
        prayer.data[recid] = datastore.db.getData('/' + recid);
    } catch(err) {
        return;
    }
    web.ios.sockets.in(sheetAlias + '/' + recid).emit('Watch', prayer);
};


Crier.prototype.gearSockets = function gearWebsockets(boss, cb) {
    web.ios.set('authorization', function (handshake, callback) {
      callback(null, true);
    });

    web.ios.on('connection', (socket) => {
        var crier = web.minion.crier;

        // #### Standard Messages
        socket.on('disconnect', () => web.logger.info('onDisconnect: ' + socket.id));
        // #### Crier Minion Messages
        socket.on('Watch', (message) => crier.onWatch(socket, message));
        socket.on('Unwatch', (message) => crier.onUnwatch(socket, message));

        // - Send a 'Connected' message back to the client
        crier.emitConnected(socket);
        web.logger.info('connected: ' + socket.id);
    });
    cb(null, 'Crier added Socket Topics Watch and Unwatch');
};


// - Got Watch request
Crier.prototype.onWatch = function onWatch(socket, msg) {
    if (msg.resource) {
        var path = msg.resource.split('/'),
            room = path[3] + '/' + path[4];
        socket.join(room);
        request({url: web.cfg.kingdom.website + msg.resource, method: 'GET', json: true},
            (err, response, json) => socket.emit('Watch', err ? err : json));

        web.logger.info('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
    }
    else {
        web.logger.info('onWatch: ' + socket.id + ' resource to join was not specified');
    }
};

// - Got Unwatch request
Crier.prototype.onUnwatch = function onUnwatch(socket, msg) {
    if (msg.resource) {
        socket.leave(msg.resource);
        web.logger.info('onUnwatch: ' + socket.id + ' left resource - ' + msg.resource);
    }
    else {
        web.logger.info('onUnwatch: ' + socket.id + ' resource to leave was not specified ');
    }
};

// #### Standard Events
Crier.prototype.emitConnected = function emitConnected(socket) {
    // Send connected
    var prayer = web.minion.angel.socketPrayer({resource: '/cyborg/crier'});
    prayer.data = {crier: 'connected'};
    socket.emit('Connected', prayer);
};

Crier.prototype.gearChatRoom = function gearChatRoom(room, cb) {
    // chatDb.exec('CREATE TABLE chat (Id SERIAL, c_from STRING, c_to STRING, c_msg STRING)');
    cb(null, 'pirate Crier added Chat room ' + room.alias);
};

Crier.prototype.onGetFromRoomsDb = function onGetFromRoomsDb(req, res, next, prayer) {
    web.logger.info('Got to onGetFromRoomsDb')
    prayer.data = { result: 'Got to onGetFromRoomsDb' }
    web.sendJson(null, res, prayer);
    /*
    chatDb.exec('SELECT * FROM chat', [], function(res){
        web.logger.info('', prayer);
        web.sendJson(null, res, prayer);
    });
    */
};

Crier.prototype.onPostToRoomsDb = function onPostToRoomsDb(req, res, next, prayer) {
    web.logger.info('Got to onPostToRoomsDb')
    prayer.data = { result: 'Got to onPostToRoomsDb' }
    web.sendJson(null, res, prayer);
    /*
    chatDb.exec('INSERT INTO chat VALUES', [], function(result){
        web.logger.info('', prayer);
        web.sendJson(null, res, prayer);
    });
    */
};

Crier.prototype.onDeleteFromRoomsDb = function onDeleteFromRoomsDb(req, res, next, prayer) {
    web.logger.info('Got to onDeleteFromRoomsDb')
    prayer.data = { result: 'Got to onDeleteFromRoomsDb' }
    web.sendJson(null, res, prayer);
    /*
    web.logger.info('', prayer);
    web.sendJson(null, res, prayer);
    */
};




module.exports = Crier;

})();