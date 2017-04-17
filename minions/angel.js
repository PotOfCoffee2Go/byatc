'use strict';

(function () {

const
    url = require('url'),
    async = require('async'),
    request = require('request'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'angel';

// Expressjs web server
var web = null;

function Angel (Web) {
    web = Web;
}

// Prayer is the payload for REST and/or Websocket responses
Angel.prototype.invokePrayer = function invokePrayer(req, res, next) {
    var fullUrl = web.minion.angel.getFullURL(req, res, next);
    var path = fullUrl.pathname.split('/');
    // Create the prayer - assume it will be forfilled
    return {
        boss: path[1],
        minion: path[2],
        resource: fullUrl.pathname,
        data: null,
        location: decodeURI(fullUrl.href),
        status: {code: 200, text: '200 - OK'},
        error: null
    };
},

// Ut-oh - prayer was not answered - so construct error response
Angel.prototype.errorPrayer = function errorPrayer(err, prayer) {
    return {
        boss: prayer.boss,
        minion: prayer.minion,
        resource: prayer.resource,
        data: null,
        location: null,
        status: {code: 418, text: '418 - I\'m a teapot'},
        error: err
    };
},

/// Get the absolute url of the request
///    ie: https://host/path?querystring#hash part from the url
/// Indicates socket.io by setting protocol and host to https://socketio
Angel.prototype.getFullURL = function getFullURL(req, res, next) {
    // When request is a string is from socket.io
    if (typeof req.resource === 'string') {
        return url.parse('https://' + hostname + req.resource, true);
    }

    // Is a RESTful (express) request
    return url.parse(req.protocol + 's://' + req.get('host') + req.originalUrl);
};

/// Frontend sites, API Docs, -  html, js, css, etc
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
    web.routes.restRouter.head(restPath, (req, res, next) => {res.sendStatus(200);});
    results.push('Angel added Trello webhook REST method HEAD ' + restPath + ' to respond with http status 200');

    //  Process trello post request - always send back 200 response code
    web.routes.restRouter.post(restPath, (req, res, next) => {
        web.webhook.trello(req, res, next, web.cfg, () => {res.sendStatus(200);});
    });
    results.push('Angel added Trello webhook REST method POST ' + restPath + ' to web.webhook.trello()');

    // Assign complete web address for Trello WebHook callbackURL ('https://domain.com/path/etc')
    board.callbackURL = web.cfg.kingdom.website + restPath;
    
    return results;
};

Angel.prototype.gearCyborgRestResources = function gearCyborgRestResources(boss, cb) {
    // Array of 'sheets' with databases for clerk to lookup data
    async.mapSeries(web.cfg.spreadsheets.sheets, function(sheet, callback) {
        var restPath = '';
        var restResources = [];

        //  Process REST requests from frontends
        restPath  = '/' + boss.name + '/clerk/' + sheet.alias + '*';
        if (sheet.db) {
            web.routes.restRouter.get(restPath, (req, res, next) => {
                var prayer = web.minion.angel.invokePrayer(req, res, next);
                web.minion.clerk.onGetFromSheetsDb(req, res, next, prayer);
            });
            restResources.push('Angel added REST method GET ' + restPath + 
                                ' which calls clerk onGetFromSheetsDb()');

            web.routes.restRouter.post(restPath, (req, res, next) => {
                var prayer = web.minion.angel.invokePrayer(req, res, next);
                web.minion.clerk.onPostToSheetsDb(req, res, next, prayer);
            });
            restResources.push('Angel added REST method POST ' + restPath + 
                                ' which calls clerk onPostToSheetsDb()');

            web.routes.restRouter.delete(restPath, (req, res, next) => {
                var prayer = web.minion.angel.invokePrayer(req, res, next);
                web.minion.clerk.onDeleteFromSheetsDb(req, res, next, prayer);
            });
            restResources.push('Angel added REST method DELETE ' + restPath + 
                                ' which calls clerk onDeleteFromSheetsDb()');
        }
        else {
            if (sheet.rows) {
                restPath  = '/' + boss.name + '/clerk/' + sheet.alias;
                web.routes.restRouter.get(restPath, (req, res, next) => {
                    var prayer = web.minion.angel.invokePrayer(req, res, next);
                    web.minion.clerk.onGetAuctionRows(req, res, next, prayer);
                });
                restResources.push('Angel added REST method GET ' + restPath +
                                   ' which calls clerk onGetAuctionRows()');
            }
        }
        callback(null, restResources);
        
    }, (err, results) => {cb(err, results);});
};


Angel.prototype.relayQueenCommandToNinja = function relayQueenCommandToNinja(boss, cb) {
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

Angel.prototype.relayQueenCommandToPirate = function relayQueenCommandToPirate(boss, cb) {
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


Angel.prototype.gearNinjaRestResources = function gearNinjaRestResources(cb) {
    var restPath = '';
        //  Process REST requests from frontends
        restPath  = '/ninja/clerk/bid/*';
        web.routes.restRouter.post(restPath, (req, res, next) => {
            var prayer = web.minion.angel.invokePrayer(req, res, next);
            web.minion.clerk.onBid(req, res, next, prayer);
        });
        cb(null,'ninja Angel added REST resource Post ' + restPath);

};

Angel.prototype.gearPirateRestResources = function gearPirateRestResources(boss, cb) {

};






// - Get request
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