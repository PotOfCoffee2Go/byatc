'use strict';

(function (){

const
    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    JsonDB = require('node-json-db'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'architect';

var listeners = [];

// Express web server and boss for this minion
var web = null, siteDir = null; // assigned later


function Architect (expressjs) {
    web = expressjs;
}

Architect.prototype.gearBoss = function gearBoss(boss) {
    const architect = web.minion.architect;

    if (boss.name === 'cyborg') {
        // Clear the working database directory
        fs.emptyDirSync(boss.dir + '/db');

        // Check enviroment variables for the credential
        //   keys/tokens and such to our friends at Trello and Google Sheet 
        web.minion.constable.checkBossCredentials(boss);
        
        /// WebSocket Interface
//        architect.gearWebsockets(boss);
        
        /// Intercom communication between bosses
        architect.gearIntercom(boss);

        /// Interface to Trello boards
        architect.gearTrello(boss);
        
        /// Interface to Google sheets
//        architect.gearSheets.call(boss);
        
        // Have architect start up the mechanisms created
        architect.activateMachinery(boss);

    }
    
};    

/// Frontend sites, API Docs, -  html, js, css, etc
Architect.prototype.gearWebSites = function gearWebSites(sitedir) {
    siteDir = sitedir;
    web.routes.finalRouter.use('/', gearbox.markdown); // give markdown a try first
    web.routes.finalRouter.use('/docs', gearbox.markdown);
    web.routes.finalRouter.use('/docs', web.express.static(siteDir + '/docs'));

    // Error handler
    web.routes.finalRouter.use(function(req, res, next) {
        web.minion.nurse.criticalSiteCare(siteDir,req, res, next);
    });
};

/// Intercom communication between bosses
Architect.prototype.gearIntercom = function gearIntercom(boss) {
    // Todo: Intercom system
};

Architect.prototype.gearWebsockets = function gearWebsockets(boss) {
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
};
    
// Build the Trello interface
Architect.prototype.gearTrello = function gearTrello(boss) {
    if (web.cfg.trello) {

        web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
        web.trello.setCredentials(web.cfg.kingdom.keys.trello);

        // dbname, true = auto save, true = pretty
        web.cfg.trello.db = new JsonDB(boss.dir + '/db/' + web.cfg.trello.database, true, true);
    
        //  Process Trello REST requests from frontends
        web.routes.restRouter.get('/' + boss.name + '/clerk/trello*', (req, res, next) => {
            var prayer = web.minion.angel.invokePrayer(req, res, next);
            web.minion.clerk.onGetTrelloDb(req, res, next, prayer);
        });
        
        /// ---------- Requests from Trello WebHook
        web.cfg.trello[boss.name].boards.forEach((board) => {
            board.db = web.cfg.trello.db;

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
        });

        listeners.push(function(boss) {
            web.cfg.trello[boss.name].boards.forEach((board) => {
               async.series([
                    function(callback) {web.trello.getMemberBoards(board, (err) => {callback(err);})},
                    function(callback) {web.trello.getWebhooks(board, (err) => {callback(err);})},
                    function(callback) {web.trello.getBoard(board, (err) => {callback(err);})},
                    function(callback) {web.trello.getBoardComments(board, (err) => {callback(err);})},
    /*             function(callback) {
                        let myWebhooks = board.webhook;
                        if (myWebhooks.length === 0) {
                            web.trello.putWebhooks(board.db, 'Onyx and Breezy Seating Chart', board.callbackURL);
                        }
                        callback(null);
                    } */
                ]);
            });
        });
        
    }
};   
    
Architect.prototype.gearSheets = function gearSheets(boss) {
    if (web.cfg.google[boss.name].sheets) {
        web.sheets.myCredentials(web.cfg.kingdom.keys.sheets);
    }
};
    
Architect.prototype.activateMachinery = function activateMachinery(boss) {
    listeners.forEach(function(listen){
        listen(boss);
    });
};


module.exports = Architect;

})();