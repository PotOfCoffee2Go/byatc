'use strict';

(function (){

    const
        fs = require('fs'),
        util = require('util'),
        path = require('path'),
        marked = require('marked');

    // From a blatantly copy of node-json-db ./lib/Error.js 
    function NestedError(msg, id, nested) {
        var tmp = Error.apply(this, arguments);
        tmp.name = this.name = 'NestedError';
        tmp.minion = this.minion = '';

        //this.stack = tmp.stack;
        if (nested && nested.stack) delete nested.stack;
        this.message = tmp.message;
        this.inner = nested;
        this.id = id;
        return this;
    }

    util.inherits(NestedError, Error);

    NestedError.prototype.toString = function () {
        var string = this.name + ": " + this.message;
        if (this.inner) {
            return string + ':\n' + this.inner;
        }
        return string;
    };


    function MinionError(minionName, msg, id, nested) {
        var error = NestedError.call(this, msg, id, nested);
        error.name = 'MinionError';
        error.minion = minionName;
        return error;
    }

    util.inherits(MinionError, NestedError);

// Given a valid path to .md file - converts it to HTML and sends to requester
var markdown = function (req, res, next) {
    var siteDir = path.join(__dirname, '/../../bosses/www');

    var mdfile = siteDir + '/docs' + req.url;
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
            '<link rel="shortcut icon" href="favicon.ico?v=1.0" type="image/x-icon">' +
            '<link href="https://fonts.googleapis.com/css?family=Tangerine" rel="stylesheet">' +
            '<link rel="stylesheet" type="text/css" href="/docs/css/markdown.css?v=1.0">' +
            '</head><body>' +
            markedup +
            '</body></html>';
    
            res.send(page);
    });
};


    module.exports = {
        MinionError: MinionError,
        markdown: markdown
    };
    
})();