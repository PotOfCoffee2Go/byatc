'use strict';

(function (){

const
    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    marked = require('marked'),
    JsonDB = require('node-json-db'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'architect';

var listeners = [];

// Express web server and boss for this minion
var web = null, sitedir = null, commonSiteDir = null; // assigned later

// Given a valid path to .md file - converts it to HTML and sends to requester
var markdown = function (req, res, next) {

    var mdfile = commonSiteDir + '/docs' + req.url;
    var ext = path.extname(req.url);
    
    // Only interestedfilers with no or .md extension
    if (!(ext === '' || ext === '.md')) return next();
    
    // If .md and found - sweet!
    // If found by adding .md extension - sweet!
    // If found the default .md file - sweet!
    // Otherwize - we are outta here - call next express route
    if (ext === '.md' && fs.existsSync(mdfile)) () => {}; // noop
    else if (fs.existsSync(mdfile + '.md'))  mdfile += '.md';
    else if (fs.existsSync(mdfile + '/index.md')) mdfile += '/index.md';
    else return next();

    // Sweet! Markup the file
    fs.readFile(mdfile, 'utf8', (err, data) => {
        if (err) return next(err);
    
        var markedup = marked(data);
        var page = 
            '<!doctype html><html lang="en"><head><meta charset="utf-8">' + // <title>The HTML5 Herald</title>
            '<link href="https://fonts.googleapis.com/css?family=Tangerine" rel="stylesheet">' +
            '<link rel="stylesheet" type="text/css" href="/docs/css/markdown.css?v=1.0">' +
            '</head><body>' +
            markedup +
            '</body></html>';
    
            res.send(page);
    });
};

function Architect (bossWeb) {
    web = bossWeb;
}

/// Frontend sites, API Docs, -  html, js, css, etc
Architect.prototype.gearWebSites = function gearWebSites(bossSitesDir) {
    sitedir = bossSitesDir;
    commonSiteDir = path.resolve(sitedir, '../../www');

    web.finalRouter.use('/docs', markdown); // give markdown a try first
    web.finalRouter.use('/docs', web.express.static(commonSiteDir + '/docs'));
    web.finalRouter.use(web.boss, web.express.static(bossSitesDir,{index: 'index.html'}));

    web.finalRouter.use(function(req, res, next) {
        web.minion.nurse.criticalSiteCare(bossSitesDir,req, res, next);
    });
};

/// Intercom communication between bosses
Architect.prototype.gearIntercom = function gearIntercom(bossDir) {
    // Todo: Intercom system
};

Architect.prototype.gearWebsockets = function gearWebsockets() {
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
Architect.prototype.gearTrello = function gearTrello() {
    if (web.cfg.trello) {
        
        web.webhook.setCredentials(web.kingdom.keys.trello);
        web.trello.setCredentials(web.kingdom.keys.trello);

        // dbname, true = auto save, true = pretty
        web.cfg.trello.db = new JsonDB('./db/' + web.cfg.trello.database, true, true);
    
        //  Process Trello REST requests from frontends
        web.restRouter.get('/' + web.boss + '/clerk/trello*', (req, res, next) => {
            web.minion.clerk.onGetDb(req, res, next, function(err, prayer) {
                if (err) return next(err);
                web.sendJson(res, null, prayer);
            });
        });
        
        /// ---------- Requests from Trello WebHook
        web.cfg.trello[web.boss].boards.forEach((board) => {
            board.db = web.cfg.trello.db;
    
            // Trello WebHooks Verification - always send back 200 response code
            web.restRouter.head(board.callbackURL, (req, res, next) => {res.sendStatus(200);});
    
            //  Process trello get request - always send back 200 response code
            web.restRouter.get(board.callbackURL, (req, res, next) => {
                web.webhook.trello(board.db, req, res, (req, res) => {res.sendStatus(200);});
            });
            
            //  Process trello post request - always send back 200 response code
            web.restRouter.post(board.callbackURL, (req, res, next) => {
                web.webhook.trello(board.db, req, res, (req, res) => {res.sendStatus(200);});
            });
        });

        listeners.push(function() {
            web.cfg.trello[web.boss].boards.forEach((board) => {
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
    
Architect.prototype.gearSheets = function gearSheets() {
    if (web.cfg.sheets) {
    }
};
    
/// Error handling of REST and Websockets is done as last REST route by the nurse
Architect.prototype.gearRestErrorHandler = function gearRestErrorHandler() {
    web.restRouter.use(function(err, req, res, next) {
        if (err) { // Should always be true
            web.minion.nurse.criticalRestCare(err, req, res, next);
        }
    });
};

Architect.prototype.activateMachinery = function activateMachinery() {
    listeners.forEach(function(listen){
        listen();
    });
};


module.exports = Architect;

})();