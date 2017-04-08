'use strict';
(function () {

const
// Standard Node stuff
    fs = require('fs-extra'),
    path = require('path'),
    env = process.env,

// Middleware
    bodyParser = require("body-parser"),

// Princess Trello

    webhook = require('../monarchy/princess/trello/webhook'),    // Request handlers for Trello Webhooks
    trello = require('../monarchy/princess/trello/app'),


// Princess Google sheets
    spreadsheets = require('../monarchy/princess/sheets/app');
    
// Configuration
var appDir = path.dirname(require.main.filename);
var cfg = require(appDir + '/../config.js');  

/// Helper to send JSON responses
function sendJson(err, res, data) {
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (err) {
        res.json({error: err});
    }
    else {
        res.json(data);
    }
}

module.exports = function (asTheQueenCommands) {

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
    app.get('/version', (req, res, next) => {sendJson(null, res, {version: '1.0.0'});});
    
    /// Health required by OpenShift or whoever wants to check if server listening
    app.get('/health', (req, res, next) => {sendJson(null, res, {'health':'ok'});});

    /// Not much else is going to happen until Her Majesty commands it so
    app.post('/queen/commands/:boss/:cmd', (req, res, next) => {
        res.type('text');
        //try {

        
            cfg.kingdom = req.body.kingdom;
            asTheQueenCommands[req.params.cmd](req.params.boss, function (err, reply) {
                res.send(reply);
            });
            
            
            
            
        //}
        //catch(err) { reply = 'Boss ' + req.params.boss + ' *embarrassed* sorry My Queen! ' +
        //        'I do not understand your command or failed to ' + req.params.cmd;
        //        reply += '\n' + err.message; }

    });


    /// -- Main REST Routes --
    
    var restRouter = express.Router();
    // The architect will populate this router with the boss routes
    //  once the /queen/commands/startMachines (above)
    app.use(function mRestRouter(req, res, next) {
      restRouter(req, res, next);
    });

    /// -- Final Routes --

    // The architect will populate this router with the trailing routes
    //  to final error handlers, docs, websites at end of the route list (below)
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
                console.log('Web Server waiting for commands from Her Majesty');
            }
        );
   }
    
    var web = {
        boss: {name:'unassigned'},
        bosses: {},
        cfg: cfg,
        express: express,
        app: app,
        minion: null,
        routes: {
            restRouter: restRouter,
            finalRouter: finalRouter,
        },
        listen: listen,
        ios: ios,
        webhook: webhook,
        trello: trello,
        spreadsheets: spreadsheets,
        sendJson: sendJson
    };

    // Minions live here
    web.minion = {
        angel: new (require('../minions/angel'))(web),
        architect:  new (require('../minions/architect'))(web),
        chef: new (require('../minions/chef'))(web),
        clerk: new (require('../minions/clerk'))(web),
        constable: new (require('../minions/constable'))(web),
        nurse: new (require('../minions/nurse'))(web)
    };

    return web;
};

})();
