'use strict';
(function() {

    const
        path = require('path'),
        env = process.env,

        // Logger    
        Winston = require('winston'),

        // Middleware
        bodyParser = require("body-parser"),

        // Princess Trello
        webhook = require('../monarchy/princess/trello/webhook'),
        trello = require('../monarchy/princess/trello/app'),

        // Princess Sheets
        spreadsheets = require('../monarchy/princess/sheets/app');

    // Configuration
    var appDir = path.dirname(require.main.filename),
        cfg = require(appDir + '/../config.js');

    // Helper to send JSON responses
    function sendJson(err, res, data) {
        res.setHeader('Cache-Control', 'no-cache, no-store');
        if (err) {
            res.json({
                error: err
            });
        }
        else {
            res.json(data);
        }
    }

    module.exports = (asTheQueenCommands) => {

        // Console logger
        var logger = new Winston.Logger({
            transports: [
                new Winston.transports.Console({
                    colorize: true
                })
            ]
        });

        // HTTP(S) server
        var
            express = require('express'),
            app = express(),
            server = require('http').Server(app),
            ios = require('socket.io')(server);

        // JSON body parser
        app.use(bodyParser.json());

        // -- Basic Routes --

        // Version info
        app.get('/version', (req, res, next) => sendJson(null, res, {
            version: '1.0.0'
        }));

        // Health required by OpenShift or whoever wants to check if server listening
        app.get('/health', (req, res, next) => sendJson(null, res, {
            'health': 'ok'
        }));

        // Not much happens until Her Majesty commands it so
        app.post('/queen/commands/:boss/:cmd', (req, res, next) => {
            res.type('text');
            cfg.kingdom = req.body.kingdom;
            asTheQueenCommands[req.params.cmd](req.params.boss, function(err, reply) {
                res.send(JSON.stringify(reply, null, 2));
            });
        });


        // -- Main RESTful Routes --

        // Router will contain the RESTful requests
        var restRouter = express.Router();
        app.use((req, res, next) => {
            restRouter(req, res, next);
        });

        // -- Trailing Routes --

        // This router contains the last routes to websites, docs, and
        //  error handlers at end of the route list
        var trailingRouter = express.Router();
        app.use((req, res, next) => {
            trailingRouter(req, res, next);
        });

        // For Cloud9 the port/ip is env.PORT and env.IP
        // For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP
        function listen() {
            server.listen(
                env.OPENSHIFT_NODEJS_PORT || env.PORT || 3000,
                env.OPENSHIFT_NODEJS_IP || env.IP || 'localhost',
                () => {
                    web.logger.info('Web Server waiting for commands from Her Majesty');
                }
            );
        }

        var web = {
            boss: {
                name: 'unassigned'
            },
            bosses: {},
            cfg: cfg,
            express: express,
            app: app,
            minion: null,
            routes: {
                restRouter: restRouter,
                trailingRouter: trailingRouter,
            },
            listen: listen,
            ios: ios,
            logger: logger,
            webhook: webhook,
            trello: trello,
            spreadsheets: spreadsheets,
            sendJson: sendJson
        };

        // Minions live here
        web.minion = {
            angel: new(require('../minions/angel'))(web),
            architect: new(require('../minions/architect'))(web),
            chef: new(require('../minions/chef'))(web),
            clerk: new(require('../minions/clerk'))(web),
            constable: new(require('../minions/constable'))(web),
            crier: new(require('../minions/crier'))(web),
            nurse: new(require('../minions/nurse'))(web)
        };

        return web;
    };

})();
