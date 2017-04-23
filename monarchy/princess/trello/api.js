'use strict';

(function(){

const fs = require('fs'),
      request = require('request');
      
const api = JSON.parse(fs.readFileSync(__dirname + '/api.json', "utf8"));

// Trello key and token
var keys = null;

// FIFO queue of messages that will be sent to Trello
var trelloEntries = [];

// Using an event emitter to throttle updates to trello
//   so does not over run the Trello rate limit
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// When we get a 'CallTrello' event get entry from fifo queue and send
myEmitter.on('CallTrello', () => {
    if (trelloEntries.length) { // there are entries to send to trello
        var entry = trelloEntries[0];
        trelloEntries.shift();
        send(entry);
    }
});

var limiterId = null;
function limiter(ms) {
    ms = ms || 250; // Four calls per second
    var x = 0;
    limiterId = setInterval(() => {
        myEmitter.emit('CallTrello');
        if (++x === 4) {
            x = 0;
            if (trelloEntries.length === 0) {
                clearInterval(limiterId);
                limiterId = null;
            }
        }
   }, ms);
}


// Validate the request has all the required fields
function validateData(tapi, data, cb) {
    var result = true;
    var uriFields = getUriFields(tapi.url);
    uriFields.forEach((field) => {
        if (typeof data[field] === 'undefined') {
            cb(new Error('Missing required field "'+ field + '" in data'));
            result = false;
        }
    });
    tapi.params.forEach((param) => {
        if (param.Required === 'Required') {
            if (typeof data[param] === 'undefined') {
                cb(new Error('Missing required field "'+ param + '" in data'));
                result = false;
            }
        }
    });
    
    return result;
}

// Find the variables defined in the url
function getUriFields(uri) {
    var fields = [];
    var url = uri.replace(/\[/g,'#').replace(/\]/g,'#');
    var subs = url.split('#');
    for (let i=0; i<subs.length; i++) {
        if (i % 2) fields.push(subs[i]);
    }
    return fields;
}

// Replace the variable field(s) in the url with the appropriate data
function replaceUriFieldsWithData(options, data) {
    // Replace the tokens in the uri with actual data
    var fields = getUriFields(options.uri);
    fields.forEach((field) => {
        if (data[field]) options.uri = options.uri.replace('[' + field +']', data[field]);
    });
}

// Place the data in the querystring or body as appropriate for the request
function placeDataIntoRequest(options, data) {
    // Data is in querystring when a get
    if (options.method === 'GET' || options.method === 'DELETE') {
        Object.assign(options.qs, data);
    }
    else { // data is in the body for PUT,POST,etc.
        options.body = data;
    }
}

// Build the querystring and/or body of the request
function buildRequest(tapi, data, cb) {
    var options = {
        method: tapi.method,
        uri: 'https://api.trello.com/1' + tapi.url,
        qs: {
            key: keys.key,
            token: keys.token,
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    
    // Check the validity of the request and put the data where it belongs
    if (validateData(tapi,data, (err) => console.log(err))) {
        replaceUriFieldsWithData(options, data);
        placeDataIntoRequest(options, data);
        cb(null, options);
    }
    else {
        cb(new Error('Data is missing fields'), options);
    }

}

// Push this request onto the Trello entry queue
function push(cmd, data, cb) {
    // Insure that we have minimally empty data and default callback 
    data = data || {};
    cb = cb || function(err) {if (err) console.log(err);};
    
    // Lookup the layout of this command/request
    var tapi = api[cmd] === undefined ? null : api[cmd];
    if (!tapi) {
        cb(new Error("Invalid command '" + cmd + "'"), {});
        return;
    }
    
    buildRequest(tapi, data, (err, options) => {
        if (err) { // ut-oh - got an error building the request
            cb(err, options);
            return;
        }
        else { // Push on the queue
            trelloEntries.push({byatc: {cmd: cmd, log: cmd + ': '}, options: options, cb: cb});
        }
    });

    
}

// Send a request to Trello - when done fire the next request
//   in most cases this will stay below the 10 call per second limit
function send(entry) {
    var options = entry.options,
        cb = entry.cb;

    request(options, (err, response, body) => {
        if (!err) {
            entry.response = body;
            delete options.qs.key;
            delete options.qs.token;
            cb(null, entry);
        }
        else {
            entry.response = err;
            delete options.qs.key;
            delete options.qs.token;
            cb(err, entry);
        }
    });
}

    module.exports = {
        setCredentials: (creds) => {keys = {key: creds.key, token: creds.token };},
        // Push request on the FIFO queue
        getToken: () => {return keys.token},
        // Push request on the FIFO queue
        push: push,
        // Send requests that are on the FIFO queue
        send: (ms) => {
            ms = ms || null;
            if (!limiterId) limiter(ms);
        }
    };

})();