/*
 * /minions/angel.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file creates the resource paths of the web server(s), standardizes
 * message structure and routes to function to process the requests
 *
 */

'use strict';

(function() {

    const
        url = require('url'),
        async = require('async'),
        moment = require('moment-timezone'),
        gearbox = require('./#gearing/gearbox'),

        MinionError = gearbox.MinionError,
        minionName = 'angel';

    // Expressjs web server
    var web = null;

    function Angel(Web) {
        web = Web;
    }

    // Prayer is the payload for REST and/or Websocket responses
    Angel.prototype.invokePrayer = function invokePrayer(req, res, next) {
        var guestkey = null,
            authHeader = req.headers.authorization;
        if (authHeader) {
            guestkey = web.minion.constable.verifyGuestKey(authHeader);
        }

        var fullUrl = web.minion.angel.getFullURL(req, res, next);
        var path = fullUrl.pathname.split('/');
        // Create the prayer - assume it will be forfilled
        return {
            resource: decodeURI(fullUrl.pathname),
            data: {},
            status: {
                code: 200,
                text: '200 - OK',
                guest: (guestkey) ? guestkey.guest : null,
                boss: path[1],
                minion: path[2],
                method: req.method,
                location: decodeURI(fullUrl.href),
                timestamp: new Date()
            },
            error: null
        };
    };

    // Prayer is the payload for REST and/or Websocket responses
    Angel.prototype.socketPrayer = function socketPrayer(message) {
        // Create the prayer - assume it will be forfilled
        var path = message.resource.split('/');
        return {
            resource: message.resource,
            data: {},
            status: {
                code: 200,
                text: '200 - OK',
                boss: path[1],
                minion: path[2],
                method: message.method,
                location: null,
                timestamp: new Date()
            },
            error: null
        };
    };

    // Ut-oh - prayer was not answered - so construct error response
    Angel.prototype.errorPrayer = function errorPrayer(err, prayer) {
        return {
            resource: prayer.resource,
            data: {},
            status: {
                token: prayer.status.token,
                code: 418,
                text: '418 - I\'m a teapot',
                boss: prayer.boss,
                minion: prayer.minion,
                method: prayer.method,
                location: null,
                timestamp: prayer.status.timestamp
            },
            error: err
        };
    };


    // Get the absolute url of the request
    //    ie: https://host/path?querystring#hash part from the url
    // Indicates socket.io by setting protocol and host to https://socketio
    Angel.prototype.getFullURL = function getFullURL(req, res, next) {
        // Is a RESTful (express) request
        return url.parse(req.protocol + 's://' + req.get('host') + req.originalUrl);
    };

    // Frontend sites, API Docs, -  html, js, css, etc
    Angel.prototype.gearTrailingRoutes = function gearTrailingRoutes(siteDir) {
        web.routes.trailingRouter.use('/docs', gearbox.markdown);
        web.routes.trailingRouter.use('/docs', web.express.static(siteDir + '/docs'));
        web.routes.trailingRouter.use('/', gearbox.markdown); // give markdown a try first
        web.routes.trailingRouter.use('/', web.express.static(siteDir + '/'));

        // Error handler
        web.routes.trailingRouter.use(function(req, res, next) {
            web.minion.nurse.criticalSiteCare(req, res, next, siteDir);
        });
    };


    Angel.prototype.gearTrelloWebhook = function gearTrelloWebhook(boss, board) {
        var restPath, results = [];

        // Trello WebHook
        restPath = '/' + boss.name + '/webhook/trello/' + board.alias;

        // Trello WebHook Verification - always send back 200 response code
        web.routes.restRouter.head(restPath, (req, res, next) => res.sendStatus(200));
        results.push(boss.name + ' angel added Trello webhook REST method HEAD ' + restPath + ' to respond with http status 200');

        //  Process trello post request - always send back 200 response code
        web.routes.restRouter.post(restPath, (req, res, next) => {
            web.webhook.trello(req, res, next, web.cfg, () => res.sendStatus(200));
        });
        results.push(boss.name + ' angel added Trello webhook REST method POST ' + restPath + ' to web.webhook.trello()');

        // Assign complete web address for Trello WebHook callbackURL ('https://domain.com/path/etc')
        board.callbackURL = web.cfg.kingdom.website + restPath;

        return results;
    };

    Angel.prototype.gearCyborgRestResources = function gearCyborgRestResources(boss, cb) {
        async.series([
            // Array of rooms to store and retrieve messages
            callback =>
            // Array of 'sheets' with databases for chef and clerk
            async.mapSeries(web.cfg.spreadsheets.sheets, function(sheet, callbackmap) {
                var restPath = '';
                var restResources = [];

                //  Process REST requests from frontends
                restPath = '/' + boss.name + '/chef/' + sheet.alias + '*';
                if (sheet.db) {
                    web.routes.restRouter.get(restPath, (req, res, next) => {
                        var prayer = web.minion.angel.invokePrayer(req, res, next);
                        web.minion.chef.onGetFromSheetsDb(req, res, next, prayer);
                    });
                    restResources.push(boss.name + ' angel added REST method GET ' + restPath +
                        ' which calls chef onGetFromSheetsDb()');

                    restPath = '/' + boss.name + '/clerk/' + sheet.alias + '*';
                    web.routes.restRouter.post(restPath, (req, res, next) => {
                        var prayer = web.minion.angel.invokePrayer(req, res, next);
                        web.minion.clerk.onPostToSheetsDb(req, res, next, prayer);
                    });
                    restResources.push(boss.name + ' angel added REST method POST ' + restPath +
                        ' which calls clerk onPostToSheetsDb()');

                    web.routes.restRouter.delete(restPath, (req, res, next) => {
                        var prayer = web.minion.angel.invokePrayer(req, res, next);
                        web.minion.clerk.onDeleteFromSheetsDb(req, res, next, prayer);
                    });
                    restResources.push(boss.name + ' angel added REST method DELETE ' + restPath +
                        ' which calls clerk onDeleteFromSheetsDb()');
                }
                else {
                    if (sheet.rows) {
                        restPath = '/' + boss.name + '/chef/' + sheet.alias;
                        web.routes.restRouter.get(restPath, (req, res, next) => {
                            var prayer = web.minion.angel.invokePrayer(req, res, next);
                            web.minion.chef.onGetAuctionRows(req, res, next, prayer);
                        });
                        restResources.push(boss.name + ' angel added REST method GET ' + restPath +
                            ' which calls chef onGetAuctionRows()');
                    }
                }

                callbackmap(null, restResources);

            }, (err, results) => {
                callback(err, results);
            }),

            // Guest login
            callback => {
                var restPath = '/' + boss.name + '/constable/guests/login';
                web.routes.restRouter.post(restPath, (req, res, next) => {
                    var prayer = web.minion.angel.invokePrayer(req, res, next);
                    web.minion.constable.onPostGuestLogin(req, res, next, prayer);
                });

                callback(null, boss.name + ' angel added REST method POST ' + restPath +
                    ' which calls constable onPostGuestLogin()');
            }
        ], (err, results) => cb(err, results));
    };

    Angel.prototype.gearNinjaRestResources = function gearNinjaRestResources(cb) {
        var restPath = '';
        //  Process REST requests from frontends
        restPath = '/ninja/clerk/bid/*';
        web.routes.restRouter.post(restPath, (req, res, next) => {
            var prayer = web.minion.angel.invokePrayer(req, res, next);
            web.minion.clerk.onBid(req, res, next, prayer);
        });
        cb(null, 'ninja Angel added REST resource Post ' + restPath +
            ' which calls clerk onBid()');

    };

    Angel.prototype.gearPirateRestResources = function gearPirateRestResources(boss, cb) {
        // Array of 'rooms' with databases for crier
        async.mapSeries(web.cfg.chat.rooms, function(room, callback) {
            var restPath = '';
            var restResources = [];

            //  Process REST requests from frontends
            restPath = '/' + boss.name + '/crier/' + room.alias + '*';
            if (room.db) {
                web.routes.restRouter.get(restPath, (req, res, next) => {
                    var prayer = web.minion.angel.invokePrayer(req, res, next);
                    web.minion.crier.onGetFromRoomsDb(req, res, next, prayer);
                });
                restResources.push(boss.name + ' angel added REST method GET ' + restPath +
                    ' which calls crier onGetFromRoomsDb()');

                web.routes.restRouter.post(restPath, (req, res, next) => {
                    var prayer = web.minion.angel.invokePrayer(req, res, next);
                    web.minion.crier.onPostToRoomsDb(req, res, next, prayer);
                });
                restResources.push(boss.name + ' angel added REST method POST ' + restPath +
                    ' which calls crier onPostToRoomsDb()');

                web.routes.restRouter.delete(restPath, (req, res, next) => {
                    var prayer = web.minion.angel.invokePrayer(req, res, next);
                    web.minion.crier.onDeleteFromRoomsDb(req, res, next, prayer);
                });
                restResources.push(boss.name + ' angel added REST method DELETE ' + restPath +
                    ' which calls crier onDeleteFromRoomsDb()');
            }
            callback(null, restResources);

        }, (err, results) => cb(err, results));
    };


    module.exports = Angel;


})();
