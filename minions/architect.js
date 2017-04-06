'use strict';

(function (){

const
    fs = require('fs-extra'),
    async = require('async'),
    JsonDB = require('node-json-db'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'architect';

var listeners = [];

// Express web server and boss for this minion
var web = null, siteDir = null; // assigned later


function Architect (Web) {
    web = Web;
}

Architect.prototype.gearBoss = function gearBoss(boss, cb) {
    const architect = web.minion.architect;

    // Clear the boss working database directory
    fs.emptyDirSync(boss.dir + '/db');

    // Check enviroment variables for the credential keys/tokens and such
    web.minion.constable.checkBossCredentials(boss);
    
    async.series([
        function(callback) {architect.gearIntercom(boss, (err) => {callback(err);})},
        //function(callback) {architect.gearWebsockets(boss, (err) => {callback(err);})},
        function(callback) {architect.gearTrello(boss, (err) => {callback(err);})},
        function(callback) {architect.gearSheets(boss, (err) => {callback(err);})},
    ],
    function(err) {
        if (err) { cb(err); return;}
        architect.activateMachinery(boss);
    });

};    

/// Frontend sites, API Docs, -  html, js, css, etc
Architect.prototype.gearWebSites = function gearWebSites(sitedir) {
    siteDir = sitedir;
    web.routes.finalRouter.use('/', gearbox.markdown); // give markdown a try first
    web.routes.finalRouter.use('/docs', gearbox.markdown);
    web.routes.finalRouter.use('/docs', web.express.static(siteDir + '/docs'));
    web.routes.finalRouter.use('/', web.express.static(siteDir + '/docs'));

    // Error handler
    web.routes.finalRouter.use(function(req, res, next) {
        web.minion.nurse.criticalSiteCare(siteDir,req, res, next);
    });
};

/// Intercom communication between bosses
Architect.prototype.gearIntercom = function gearIntercom(boss, cb) {
    // Todo: Intercom system
    if (cb) cb(null);
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
    
// Build the Trello interface
Architect.prototype.gearTrello = function gearTrello(boss, cb) {
    if (web.cfg.trello) {

        web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
        web.trello.setCredentials(web.cfg.kingdom.keys.trello);

        /// ---------- Requests from Trello WebHook
        web.cfg.trello.boards.forEach((board) => {
            // dbname, true = auto save, true = pretty
            board.db = new JsonDB(boss.dir + '/db/' + web.cfg.trello.database + board.alias, true, true);
    
            //  Process Trello REST requests from frontends
            web.routes.restRouter.get('/' + boss.name + '/clerk/trello/*', (req, res, next) => {
                var prayer = web.minion.angel.invokePrayer(req, res, next);
                web.minion.clerk.onGetTrelloDb(req, res, next, prayer);
            });

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

            web.trello.gearTrelloBoard(board, (err) => {
                if (err) {
                    console.log('Problem with trello board - %s', board.name, err);
                }
                else {
                    console.log('Trello board in DB - %s', board.name);
                }
            });
            
        });
        
    }

    if (cb) cb(null);

};   
    
Architect.prototype.gearSheets = function gearSheets(boss, cb) {

    if (web.cfg.spreadsheets) {

        web.spreadsheets.setCredentials(web.cfg.kingdom.keys.sheets);

        web.cfg.spreadsheets.sheets.forEach((sheet) => {
            // dbname, true = auto save, true = pretty
            sheet.db = new JsonDB(boss.dir + '/db/' + web.cfg.spreadsheets.database + sheet.alias, true, true);
    
            //  Process Sheet REST requests from frontends
            web.routes.restRouter.get('/' + boss.name + '/clerk/sheet/*', (req, res, next) => {
                var prayer = web.minion.angel.invokePrayer(req, res, next);
                web.minion.clerk.onGetSheetDb(req, res, next, prayer);
            });

/*
            // Trello WebHook
            sheet.callbackURL = '/' + boss.name + '/webhook/sheet/' + sheet.alias;

            //  Process sheet get request - always send back 200 response code
            web.routes.restRouter.get(sheet.callbackURL, (req, res, next) => {
                web.webhook.trello(sheet.db, req, res, (req, res) => {res.sendStatus(200);});
            });

            //  Process sheet post request - always send back 200 response code
            web.routes.restRouter.post(sheet.callbackURL, (req, res, next) => {
                web.webhook.trello(sheet.db, req, res, (req, res) => {res.sendStatus(200);});
            });
*/
            web.spreadsheets.gearSheet(sheet, (err) => {
                if (err) {
                    console.log('Problem with spreadsheets sheet - %s', sheet.name, err);
                }
                else {
                    console.log('Spreadsheets sheet in DB - %s', sheet.name);
                }
            });
            
        });
        
    }

};
    
Architect.prototype.activateMachinery = function activateMachinery(boss) {
    listeners.forEach(function(listen){
        listen(boss);
    });
};


module.exports = Architect;

})();