'use strict';

(function (){

const
    fs = require('fs-extra'),
    async = require('async'),
    request = require('request'),
    JsonDB = require('node-json-db'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'architect';

var listeners = [];

// Express web server and boss for this minion
var web = null; // assigned later


function Architect (Web) {
    web = Web;
}

/// Frontend sites, API Docs, -  html, js, css, etc
Architect.prototype.gearWebSites = function gearWebSites(siteDir) {
    web.routes.finalRouter.use('/', gearbox.markdown); // give markdown a try first
    web.routes.finalRouter.use('/', web.express.static(siteDir + '/docs'));
    web.routes.finalRouter.use('/docs', gearbox.markdown);
    web.routes.finalRouter.use('/docs', web.express.static(siteDir + '/docs'));

    // Error handler
    web.routes.finalRouter.use(function(req, res, next) {
        web.minion.nurse.criticalSiteCare(req, res, next, siteDir);
    });
};

/// Intercom communication between bosses
Architect.prototype.gearIntercom = function gearIntercom(boss, cb) {
    // Todo: Intercom system
    if (cb) cb(null,['Boss intercom started']);
};

Architect.prototype.gearWebsockets = function gearWebsockets(boss, cb) {
    if (web.cfg.websockets) {
        listeners.push(function() {
            web.ios.on('connection', (socket) => {
                var angel = web.minion.angel;

                /// #### Standard Messages
                socket.on('disconnect', () => {console.log('onDisconnect: ' + socket.id);});

                /// #### Angel Minion Messages
                socket.on('Get', (message) => {angel.onGet(socket, message);});
                socket.on('Post', (message) => {angel.onPost(socket, message);});
                socket.on('Put', (message) => {angel.onPut(socket, message);});
                socket.on('Patch', (message) => {angel.onPatch(socket, message);});
                socket.on('Delete', (message) => {angel.onDelete(socket, message);});
        
                socket.on('Watch', (message) => {angel.onWatch(socket, message);});
                socket.on('Unwatch', (message) => {angel.onUnwatch(socket, message);});
                // socket.on('update bid', (message) => {onUpdateBid(socket, message);});
        
                // - Send a 'Connected' message back to the client
                angel.emitConnected(socket);
            });
        });
    }
    if (cb) cb(null);
};

// Get data for auction from google sheets
Architect.prototype.gearSheets = function gearSheets(boss, cb) {

    if (web.cfg.spreadsheets) {

        web.spreadsheets.setCredentials(web.cfg.kingdom.keys.sheets);

        // Array of sheets to collect data from
        async.mapSeries(web.cfg.spreadsheets.sheets, function(sheet, callback) {
            // dbname, true = auto save, true = pretty
            sheet.db = new JsonDB(boss.dir + '/db/' + web.cfg.spreadsheets.database + sheet.alias, true, true);
    
            web.spreadsheets.gearSheet(sheet, callback);
            
        }, (err, results) => {
            if (cb) cb(err, results);
        });            
    }
};

Architect.prototype.getTrelloInfo = function getTrelloInfo(boss, cb) {
    if (web.cfg.trello) {
        web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
        web.trello.setCredentials(web.cfg.kingdom.keys.trello);
        
        web.trello.getTrelloInfo(web.cfg, (err, results) => {
            if (cb) cb(err, results);
        });
    }
};


// Build the Trello interface
Architect.prototype.gearTrello = function gearTrello(boss, cb) {
    if (web.cfg.trello) {

        // Array of boards to collect data from
        async.mapSeries(web.cfg.trello.boards, function(board, callback) {
            // dbname, true = auto save, true = pretty
            board.db = new JsonDB(boss.dir + '/db/' + web.cfg.trello.database + board.alias, true, true);
    
            // Trello WebHook
            board.callbackURL = '/' + boss.name + '/webhook/trello/' + board.alias;

            // Trello WebHooks Verification - always send back 200 response code
            web.routes.restRouter.head(board.callbackURL, (req, res, next) => {res.sendStatus(200);});

            //  Process trello get request - always send back 200 response code
            web.routes.restRouter.get(board.callbackURL, (req, res, next) => {
                web.webhook.trello(board.db, req, res, (req, res) => {res.sendStatus(200);});
            });

            //  Process trello post request - always send back 200 response code
            web.routes.restRouter.post(board.callbackURL, (req, res, next) => {
                web.webhook.trello(board.db, req, res, (req, res) => {res.sendStatus(200);});
            });

            // Trello WebHook Full address
            board.callbackURL = web.cfg.kingdom.websites.cyborg + board.callbackURL;

            web.trello.gearBoard(board, callback);

        }, (err, results) => {
            if (cb) cb(err, results);
        });            
    }
};   


Architect.prototype.syncTrelloBoards = function syncTrelloBoards(boss, cb) {
    if (web.cfg.trello) {
        web.trello.syncTrelloBoards(web.cfg, (err, results) => {
            if (cb) cb(err, results);
        });
    }
};


Architect.prototype.getAuctionInfo = function getAuctionInfo(boss, cb) {

    request({
        url: web.cfg.kingdom.websites.cyborg + '/cyborg/chef/serve/auctionee',
        method: 'GET' },
        function (err, response, body) { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(body);
            }
        }
    );
    
};


module.exports = Architect;

})();