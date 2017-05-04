/*
 * /minions/crier.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file handles broadcasting changes that occur in the
 * byatec auction system databases to clients watching for 
 * current updates.
 *
 */

'use strict';

(function() {
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

    function Crier(Web) {
        web = Web;
    }

    Crier.prototype.relayQueenCommandToNinja = function relayQueenCommandToNinja(boss, cb) {
        var results = [boss.name + ' relay Her Majesty command to ninja'];
        request({
                url: web.cfg.kingdom.website + '/queen/commands/ninja/startMachines',
                method: 'POST',
                json: {
                    kingdom: web.cfg.kingdom
                }
            },
            function(err, response, body) {
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
                json: {
                    kingdom: web.cfg.kingdom
                }
            },
            function(err, response, body) {
                if (err) cb(err);
                else {
                    results.push(body);
                    cb(null, results);
                }
            }
        );
    };

    Crier.prototype.broadcast = function broadcast(resource) {
        var prayer = web.minion.angel.socketPrayer({
            resource: resource
        });
        var path = resource.split('/'),
            sheetAlias = path[3],
            recid = path[4],
            datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
        try { // Remove the '/boss/clerk/alias' from resource to get the DB path
            prayer.data[recid] = datastore.db.getData('/' + recid);
        }
        catch (err) {
            return;
        }
        web.ios.sockets.in(sheetAlias + '/' + recid).emit('Watch', prayer);
    };


    Crier.prototype.gearSockets = function gearWebsockets(boss, cb) {
        web.ios.set('authorization', function(handshake, callback) {
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
        cb(null, [boss.name + ' crier added Socket Topics Watch and Unwatch']);
    };

    // - Got Watch request
    Crier.prototype.onRestful = function onRestful(socket, msg) {
        if (msg.resource) {
            var path = msg.resource.split('/'),
                room = path[3] + '/' + path[4];
            socket.join(room);
            request({
                    url: web.cfg.kingdom.website + msg.resource,
                    method: msg.status.method,
                    json: true,
                    headers: {
                        'Authorization': 'BYATEC ' + msg.status.key
                    }
                },
                (err, response, json) => socket.emit('Restful', err ? err : json));

            web.logger.info('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
        }
        else {
            web.logger.info('onWatch: ' + socket.id + ' resource to join was not specified');
        }
    };

    // - Got Watch request
    Crier.prototype.onWatch = function onWatch(socket, msg) {
        if (msg.resource) {
            var path = msg.resource.split('/'),
                room = path[3] + '/' + path[4];
            socket.join(room);
            request({
                    url: web.cfg.kingdom.website + msg.resource,
                    method: 'GET',
                    json: true,
                    headers: {
                        'Authorization': 'BYATEC ' + msg.status.key
                    }
                },
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
        var prayer = web.minion.angel.socketPrayer({
            resource: '/cyborg/crier'
        });
        prayer.data = {
            crier: 'connected'
        };
        socket.emit('Connected', prayer);
    };

    Crier.prototype.gearAlasql = function gearAlasql(cb) {
        alasql.fn.crierIndexOf = (arr, val) => {
            return arr.indexOf(val);
        };
        cb(null, 'pirate crier added custom functions to alasql');
    };

    Crier.prototype.gearChatRoom = function gearChatRoom(room, cb) {
        if (web.cfg.kingdom.reload === false)
            if (room.db.getData('/' + room.alias).length > 0)
                return cb(null, 'pirate crier kept previous Chat room ' + room.alias);

            // Using the room alias, create array to hold messages
        room.db.push('/' + room.alias, []);
        cb(null, 'pirate crier added Chat room ' + room.alias);
    };

    Crier.prototype.onGetFromRoomsDb = function onGetFromRoomsDb(req, res, next, prayer) {
        var
            result = [],
            pathList = prayer.resource.split('/'),
            idfrom = pathList[4],
            idto = pathList[5],
            room = web.cfg.chat.rooms.find(r => r.alias === pathList[3]); // guests,items,auction
        try {
            var msgs = room.db.getData('/' + room.alias);
            if (idfrom === '*' && idto)
                result = alasql('SELECT * FROM ? AS msgs WHERE crierIndexOf(idsTo,?) >= 0', [msgs, idto]);
            else if (idfrom && idto)
                result = alasql('SELECT * FROM ? AS msgs WHERE idFrom = ? AND crierIndexOf(idsTo,?) >= 0', [msgs, idfrom, idto]);
            else if (idfrom)
                result = alasql('SELECT * FROM ? AS msgs WHERE idFrom = ?', [msgs, idfrom]);
            else
                result = msgs;

        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data from chat' + pathList[3] + '.json', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = result;
        web.sendJson(null, res, prayer);
    };

    Crier.prototype.onPostToRoomsDb = function onPostToRoomsDb(req, res, next, prayer) {
        var
            msg = req.body.data,
            newData = {
                idsTo: msg.to,
                idFrom: msg.from,
                msg: msg.msg,
                time: new Date()
            },
            pathList = prayer.resource.split('/'),
            room = web.cfg.chat.rooms.find(r => r.alias === pathList[3]); // guests,items,auction
        try {
            room.db.push('/' + room.alias + '[]', newData, true);
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not post data to chat' + pathList[3] + '.json', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = newData;
        web.sendJson(null, res, prayer);

        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('POST ' + resource));


    };

    Crier.prototype.onDeleteFromRoomsDb = function onDeleteFromRoomsDb(req, res, next, prayer) {
        web.logger.info('Got to onDeleteFromRoomsDb')
        prayer.data = {
            result: 'Got to onDeleteFromRoomsDb'
        }
        web.sendJson(null, res, prayer);

        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('DELETE ' + resource));

    };




    module.exports = Crier;

})();
