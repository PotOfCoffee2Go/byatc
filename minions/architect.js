'use strict';

(function () {

const
    fs = require('fs-extra'),
    async = require('async'),
    request = require('request'),
    JsonDB = require('node-json-db'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'architect';

// Expressjs web server
var web = null; // assigned later


function Architect (Web) {
    web = Web;
}


/// Intercom communication between bosses
Architect.prototype.gearIntercom = function gearIntercom(boss, cb) {
    // Todo: Intercom system
    cb(null,['Boss intercom started']);
};

Architect.prototype.gearWebsockets = function gearWebsockets(boss, cb) {
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
    cb(null);
};

// Get data for auction from google sheets
Architect.prototype.gearSheets = function gearSheets(boss, cb) {
    web.minion.constable.givePrincessSheetsCredentials();

    // Array of sheets to collect data from
    async.mapSeries(web.cfg.spreadsheets.sheets, function(sheet, callback) {
        // dbname, true = auto save, true = pretty
        sheet.db = new JsonDB(boss.dir + '/db/' + web.cfg.spreadsheets.database + sheet.alias, true, true);

        web.spreadsheets.gearSheet(boss, sheet, callback);
        
    }, (err, results) => {cb(err, results);});            
};

Architect.prototype.rousePrincessTrello = function rousePrincessTrello(cb) {
    web.minion.constable.givePrincessTrelloCredentials();
    web.trello.rousePrincessTrello(web.cfg, (err, results) => cb(err, results));
};


// Build the Trello interface
Architect.prototype.gearTrello = function gearTrello(boss, cb) {
    var whresults = [];
    // Array of boards to collect data from
    async.mapSeries(web.cfg.trello.boards, function(board, callback) {
        // dbname, true = auto save, true = pretty
        board.db = new JsonDB(boss.dir + '/db/' + web.cfg.trello.database + board.alias, true, true);

        // Add the paths that will be used by the Trello WebHooks
        whresults = whresults.concat(web.minion.angel.gearTrelloWebhook(boss, board));

        web.trello.gearBoard(board, callback);

    }, (err, results) => {
        results = whresults.concat(results);
        cb(err, results);
    });            
};   


Architect.prototype.gearTrelloBoards = function gearTrelloBoards(cb) {
    web.trello.gearTrelloBoards(web.cfg, (err, results) => {cb(err, results);});
};


Architect.prototype.gearAuction = function gearAuction(boss, cb) {
    request({
        url: web.cfg.kingdom.websites.cyborg + '/cyborg/chef/serve/auctioneer',
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