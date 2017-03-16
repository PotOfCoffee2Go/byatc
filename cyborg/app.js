'use strict';

//console.log(process.env.TRELLO_KEY);
//console.log(process.env.TRELLO_TOKEN);



const
// Standard Node stuff
    env = process.env,

// Middleware
    bodyParser = require("body-parser"),

// Routes
    webhook = require('./routes/webhook.js'),    // Request handlers for Trello Webhooks
    
    JsonDB = require("node-json-db"),
    trello = require('./trellocommands.js');

var resultDB = new JsonDB('results.json', true, true); // true = auto save, true = pretty


/// HTTP(S) server
var
express = require('express'),  
    app = express(),  
 server = require('http').Server(app);

/// Frontend(s) html, js, stylesheet, etc
app.use(express.static(__dirname + '/www'));

/// JSON body parser
app.use(bodyParser.json());

/// ---------- Routes 

/// Version info
app.get('/version', (req, res, next) => {sendJson(res, null, {version: '1.0.0'});});

/// Health for openshift
app.get('/health', (req, res, next) => {sendJson(res, null, {'health':'ok'});});

/// ---------- Trello Callback from WebHook
// Health for Trello WebHooks - always send back 200 response code
app.head('/trellocallback', (req, res, next) => {res.sendStatus(200);});

//  Process trello request - always send back 200 response code
app.get('/trellocallback', (req, res, next) => {
    webhook.trello(resultDB, req, res, (req, res) => {res.sendStatus(200);});
});

//  Process trello request - always send back 200 response code
app.post('/trellocallback', (req, res, next) => {
    webhook.trello(resultDB, req, res, (req, res) => {res.sendStatus(200);});
});

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


// For Cloud9 the port/ip is env.PORT and env.IP
// For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP
//server.listen( env.OPENSHIFT_NODEJS_PORT || 3000, env.OPENSHIFT_NODEJS_IP || 'localhost', () => {
server.listen(
    env.OPENSHIFT_NODEJS_PORT || env.PORT || 3000,
    env.OPENSHIFT_NODEJS_IP || env.IP || 'localhost',
    () => {
        console.log('Hal9000 started... pid: ', process.pid);
        trello.getWebhooks(resultDB,(err, entry) => {
            if (err) {}
            trello.getBoard(resultDB,(err, entry) => {
                if (err) {}
                let myWebhooks = resultDB.getData('/webhooks');
                if (myWebhooks.length === 0) {
                    trello.putWebhooks(resultDB, '/trellocallback');
                }
            });
        });
    }
);

