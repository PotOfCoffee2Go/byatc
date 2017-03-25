'use strict';
(function () {

const
// Standard Node stuff
    fs = require('fs-extra'),
    path = require('path'),
    env = process.env,

// Middleware
    bodyParser = require("body-parser"),

// Trello
    webhook = require('./trello/webhook'),    // Request handlers for Trello Webhooks
    trello = require('./trello/trellocommands');

// Configuration - (copy the template unless we already did it)
var appDir = path.dirname(require.main.filename);

fs.copySync(path.resolve(appDir + '/../../config.js'),
    path.resolve(appDir + '/../config.js'),
    {overwrite: false});

var cfg = require('../config.js');  

/// Helper to send JSON responses
function sendJson(res, err, data) {
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (err) {
        res.json({error: err});
    }
    else {
        res.json(data);
    }
}

module.exports = function (boss, asTheQueenCommands) {

    // Empty or create boss database directory
    fs.emptyDirSync('../' + boss + '/db');
    
    // Populated by the Queen with the keys to the kingdom
    var kingdom = null;

    /// HTTP(S) server
    var
    express = require('express'),  
        app = express(),  
     server = require('http').Server(app),
        ios = require('socket.io')(server);
        
    /// JSON body parser
    app.use(bodyParser.json());

    /// -- Basic Routes --

    /// Version info
    app.get('/version', (req, res, next) => {sendJson(res, null, {version: '1.0.0'});});
    
    /// Health required by OpenShift or whoever wants to check if server listening
    app.get('/health', (req, res, next) => {sendJson(res, null, {'health':'ok'});});

    /// Not much else is going to happen until Her Majesty commands it so
    app.post('/queen/commands/:cmd', (req, res, next) => {
        res.type('text');
        
        var reply;
        try { 
            kingdom = req.body.kingdom;
            reply = asTheQueenCommands[req.params.cmd](); }
        catch(err) { reply = 'Boss ' + boss + ' *embarrassed* sorry My Queen! ' +
                'I do not understand your command or failed to ' + req.params.cmd;
                reply += '\n' + err.message; }

        res.send(reply);
    });


    /// -- REST Routes --
    
    var restRouter = express.Router();
    // The architect will populate this router with the boss routes
    //  once the /queen/commands/startMachines (above)
    app.use(function (req, res, next) {
      restRouter(req, res, next);
    });

    /// -- Final Routes --
    
    // The architect will populate this router with the trailing routes
    //  to error handlers, docs, websites at end of the route list (below)
    var finalRouter = express.Router();
    app.use(function (req, res, next) {
      finalRouter(req, res, next);
    });

    // For Cloud9 the port/ip is env.PORT and env.IP
    // For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP
   function listen() {
        server.listen(
            env.OPENSHIFT_NODEJS_PORT || env.PORT || 3000,
            env.OPENSHIFT_NODEJS_IP || env.IP || 'localhost',
            () => {
                console.log('Boss ' + boss + ' waiting for commands from Her Majesty');
            }
        );
   }
    
    // Placeholder for where the default minions will live
    var minion = {};

    var web = {
        boss: boss,
        cfg: cfg,
        express: express,
        app: app,
        kingdom: kingdom,
        minion: minion,
        restRouter: restRouter,
        finalRouter: finalRouter,
        listen: listen,
        ios: ios,
        webhook: webhook,
        trello: trello,
        sendJson: sendJson
    };

    // Now we have a 'web' object needed for Minions to initialize
    //  create them and place into web.minions
    var 
        Angel = require('../../minions/angel'),
        Architect =  require('../../minions/architect'),
        Chef = require('../../minions/chef'),
        Clerk = require('../../minions/clerk'),
        Constable = require('../../minions/constable'),
        Nurse = require('../../minions/nurse');

    minion.angel = new Angel(web);
    minion.architect = new Architect(web);
    minion.chef = new Chef(web);
    minion.clerk = new Clerk(web);
    minion.constable = new Constable(web);
    minion.nurse = new Nurse(web);

    return web;
};


})();
