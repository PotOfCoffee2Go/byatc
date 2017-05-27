'use strict';

(function() {

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

    NestedError.prototype.toString = function() {
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
    var markdown = function(req, res, next) {
        var siteDir = path.join(__dirname, '/../../../realms');

        var mdfile = siteDir + '/docs' + req.url;
        var ext = path.extname(req.url);

        // Only interestedfilers with no or .md extension
        if (!(ext === '' || ext === '.md')) return next();

        // If .md and found - sweet!
        // If found by adding .md extension - sweet!
        // If found the default .md file - sweet!
        // Otherwize - we are outta here - call next express route
        if (ext === '.md' && fs.existsSync(mdfile))() => {}; // noop
        else if (fs.existsSync(mdfile + '.md')) mdfile += '.md';
        else if (fs.existsSync(mdfile + '/index.md')) mdfile += '/index.md';
        else return next();

        // Sweet! Markup the file
        fs.readFile(mdfile, 'utf8', (err, data) => {
            if (err) return next(err);

            var markedup = marked(data);
            var page =
                '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
                // '<title>From where?</title>' +
                '<link rel="shortcut icon" href="favicon.ico?v=1.0" type="image/x-icon">' +
                '<link href="https://fonts.googleapis.com/css?family=Tangerine" rel="stylesheet">' +
                '<link rel="stylesheet" type="text/css" href="/docs/css/markdown.css?v=1.0">' +
                '</head><body>' +
                markedup +
                '</body></html>';

            res.send(page);
        });
    };

    var merge = {
        trelloIntoGuestDatabase: function trelloIntoGuestDatabase(web, minionName, cb) {
            // Merge the trello guest information into the guest database 
            var sheetGuests, boardGuests, error;
            var alias = 'guests';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
            try {
                sheetGuests = cfgsheet.db.getData('/');
                boardGuests = cfgboard.db.getData('/cards');
            }
            catch (err) {
                error = new MinionError(minionName, 'cyborg architect can not get guest sheets and/or board data from Dbs', 101, err);
                cb(error);
                return;
            }

            boardGuests.forEach(function(boardGuest) {
                let labels = {};
                boardGuest.labels.forEach((label) => {
                    delete label.uses;
                    labels[label.color] = label;
                });
                delete labels.uses;
                boardGuest.labels = labels;

                let attached = {};
                boardGuest.attachments.forEach((attach) => {
                    attached[attach.name] = {
                        name: attach.name,
                        url: attach.url
                    };
                });
                delete boardGuest.attachments;
                boardGuest.attachments = attached;

                let boardId = boardGuest.name.split(' ')[0];
                if (sheetGuests[boardId]) {
                    sheetGuests[boardId].trello = boardGuest;
                    cfgsheet.db.push('/' + boardId, sheetGuests[boardId]);
                }
            });

            // Clear the trello board item db
            cfgboard.db.push('/cards', []);

            // Clear the auction rows - will not be used
            cfgsheet.rows = null;

            cb(null, 'cyborg architect merged trello info into Guest database');
        },

        trelloIntoItemDatabase: function trelloIntoItemDatabase(web, minionName, cb) {
            // Merge the trello item information into the item database 
            var sheetItems, boardItems, error;
            var alias = 'items';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
            try {
                sheetItems = cfgsheet.db.getData('/');
                boardItems = cfgboard.db.getData('/cards');
            }
            catch (err) {
                error = new MinionError(minionName, 'cyborg architect can not get item sheets and/or board data from Dbs', 101, err);
                cb(error);
                return;
            }

            boardItems.forEach(function(boardItem) {
                let labels = {};
                boardItem.labels.forEach((label) => {
                    delete label.uses;
                    labels[label.color] = label;
                });
                delete labels.uses;
                boardItem.labels = labels;

                let attached = {};
                boardItem.attachments.forEach((attach) => {
                    attached[attach.name] = {
                        name: attach.name,
                        url: attach.url
                    };
                });
                delete boardItem.attachments;
                boardItem.attachments = attached;

                let boardId = boardItem.name.split(' ')[0];
                if (sheetItems[boardId]) {
                    sheetItems[boardId].trello = boardItem;
                    cfgsheet.db.push('/' + boardId, sheetItems[boardId]);
                }
            });
            // Clear the trello board item db
            cfgboard.db.push('/cards', []);

            // Clear the auction rows - will not be used
            cfgsheet.rows = null;

            cb(null, 'cyborg architect merged trello info into Item database');
        },

        categoriesIntoItemDatabase: function categoriesIntoItemDatabase(web, minionName, cb) {
            // Merge the categories into the items database
            var sheetCategory, itemCards;
            var alias = 'categories';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
            try {
                sheetCategory = cfgsheet.db.getData('/');
                itemCards = cfgitem.db.getData('/');
            }
            catch (err) {
                var error = new MinionError(minionName, 'cyborg architect can not get category sheet and/or items db', 101, err);
                cb(error);
                return;
            }

            var icards = Object.keys(itemCards);
            icards.forEach(function(idCard) {
                let itemCategory = itemCards[idCard].profile.Category;
                if (itemCategory)
                    itemCards[idCard].category = sheetCategory[itemCategory].profile;
            });

            cfgitem.db.push('/', itemCards);

            // Clear the auction rows - will not be used
            cfgsheet.rows = null;

            cb(null, 'cyborg architect merged category info into Item database');

        },


        trelloIntoCategoriesDatabase: function trelloIntoCategoriesDatabase(web, minionName, cb) {
            // Merge the trello category information into the category database 
            var sheetItems, boardItems, error;
            var alias = 'categories';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
            try {
                sheetItems = cfgsheet.db.getData('/');
                boardItems = cfgboard.db.getData('/cards');
            }
            catch (err) {
                error = new MinionError(minionName, 'cyborg architect can not get category sheets and/or board data from Dbs', 101, err);
                cb(error);
                return;
            }

            boardItems.forEach(function(boardItem) {
                let labels = {};
                boardItem.labels.forEach((label) => {
                    delete label.uses;
                    labels[label.color] = label;
                });
                delete labels.uses;
                boardItem.labels = labels;

                let attached = {};
                boardItem.attachments.forEach((attach) => {
                    attached[attach.name] = {
                        name: attach.name,
                        url: attach.url
                    };
                });
                delete boardItem.attachments;
                boardItem.attachments = attached;

                let boardId = boardItem.name.split(' ')[0];
                if (sheetItems[boardId]) {
                    sheetItems[boardId].trello = boardItem;
                    cfgsheet.db.push('/' + boardId, sheetItems[boardId]);
                }
            });
            // Clear the trello board item db
            cfgboard.db.push('/cards', []);

            // Clear the auction rows - will not be used
            cfgsheet.rows = null;

            cb(null, 'cyborg architect merged trello info into Category database');

        },

        auctionIntoGuestDatabase: function auctionIntoGuestDatabase(web, minionName, cb) {
            // Merge the auctioneer into the guests database
            var sheetAuctioneer, guestCards;
            var alias = 'auction/checkout';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgguest = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
            try {
                sheetAuctioneer = cfgsheet.db.getData('/');
                guestCards = cfgguest.db.getData('/');
            }
            catch (err) {
                var error = new MinionError(minionName, 'cyborg architect can not get auction sheet and/or guest db', 101, err);
                cb(error);
                return;
            }

            var gcards = Object.keys(guestCards);
            gcards.forEach(function(idCard) {
                guestCards[idCard].checkout = sheetAuctioneer[idCard].profile;
            });

            cfgguest.db.push('/', guestCards);

            // Clear the auctioneer database - no longer needed
            cfgsheet.db.push('/', {});

            cb(null, 'cyborg architect merged auction info into Guest database');
        },

        auctionIntoItemDatabase: function auctionIntoItemDatabase(web, minionName, cb) {
            // Merge the categories into the items database
            var sheetAuction, itemCards;
            var alias = 'auction/items';

            var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
            var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
            try {
                sheetAuction = cfgsheet.db.getData('/');
                itemCards = cfgitem.db.getData('/');
            }
            catch (err) {
                var error = new MinionError(minionName, 'cyborg architect can not get auctioninfo sheet and/or items db', 101, err);
                cb(error);
                return;
            }

            var icards = Object.keys(itemCards);
            icards.forEach(function(idCard) {
                itemCards[idCard].auction = sheetAuction[idCard].profile;
            });

            cfgitem.db.push('/', itemCards);

            // Clear the auctioneer database - no longer needed
            cfgsheet.db.push('/', {});

            cb(null, 'cyborg architect merged auction info into Item database');
        },

        removeDatabases: function removeDatabases(web, minionName, cb) {
            var removedDbs = [];
            web.cfg.spreadsheets.sheets.forEach((sheet) => {
                if (sheet.remove && sheet.remove === true) {
                    removedDbs.push(path.basename(sheet.db.filename));
                    fs.unlinkSync(sheet.db.filename);
                    sheet.db = null;
                }
            });

            cb(null, 'cyborg architect deleted merged auction info databases ' + removedDbs.join(', '));
        }
    };


    module.exports = {
        MinionError: MinionError,
        markdown: markdown,
        merge: merge,
    };

})();
