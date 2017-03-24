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
    
    /// HTTP(S) server
    var
    express = require('express'),  
        app = express(),  
     server = require('http').Server(app),
        ios = require('socket.io')(server);
        
    /// JSON body parser
    app.use(bodyParser.json());

    /// -- Basic Routes --
    //  These would be more elegant if express natively implemented a route
    //    'remove' function - then could add special handling while we wait
    //    for the queen to command us to 'startMachines'
    //    At which point would remove the temporary routes used while waiting.

    /// Version info
    app.get('/version', (req, res, next) => {sendJson(res, null, {version: '1.0.0'});});
    
    /// Health required by OpenShift or whoever wants to check if server listening
    app.get('/health', (req, res, next) => {sendJson(res, null, {'health':'ok'});});

    /// Not much else is going to happen until Her Majesty commands it so
    app.post('/queen/commands/:cmd', (req, res, next) => {
        res.type('text');

        var reply;
        try { reply = asTheQueenCommands[req.params.cmd](); }
        catch(err) { reply = 'Boss ' + boss + ' *embarrassed* sorry My Queen! ' +
                'I do not understand your command or failed to ' + req.params.cmd;
                reply += '\n' + err.message; }

        res.send(reply);
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

    // Minions
    const minion = require('../minions');

    var module = {
        boss: boss,
        cfg: cfg,
        express: express,
        app: app,
        ios: ios,
        minion: minion,
        listen: listen,
        webhook: webhook,
        trello: trello,
        sendJson: sendJson
    };
    
    return module;
};


})();
