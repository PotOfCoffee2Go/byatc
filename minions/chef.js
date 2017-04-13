'use strict';

(function () {

const
    fs = require('fs-extra'),
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    async = require('async'),
    
    MinionError = gearbox.MinionError,
    minionName = 'chef';

// Expressjs web server
var web = null;

function Chef (Web) {
    web = Web;
}

function mergeTrelloGuestDatabase(cb) {
    // Merge the trello guest information into the guest database 
    var sheetGuests, boardGuests, error;
    var alias = 'guests';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetGuests = cfgsheet.db.getData('/');
        boardGuests = cfgboard.db.getData('/cards');
    } catch(err) {
        error = new MinionError(minionName, 'Chef can not get guest sheets and/or board data from Dbs', 101, err);
        cb(error);
        return;
    }

    boardGuests.forEach(function (boardGuest) {
        let boardId = boardGuest.name.split(' ')[0];
        if(sheetGuests[boardId]) {
            sheetGuests[boardId].trello = boardGuest;
            cfgsheet.db.push('/' + boardId, sheetGuests[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);
    
    cb(null, 'Chef merged trello info into Guest database');
}

function mergeTrelloItemDatabase(cb) {
    // Merge the trello item information into the item database 
    var sheetItems, boardItems, error;
    var alias = 'items';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetItems = cfgsheet.db.getData('/');
        boardItems = cfgboard.db.getData('/cards');
    } catch(err) {
        error = new MinionError(minionName, 'Chef can not get item sheets and/or board data from Dbs', 101, err);
        cb(error);
        return;
    }

    boardItems.forEach(function (boardItem) {
        let boardId = boardItem.name.split(' ')[0];
        if(sheetItems[boardId]) {
            sheetItems[boardId].trello = boardItem;
            cfgsheet.db.push('/' + boardId, sheetItems[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);
    
    cb(null, 'Chef merged trello info into Item database');
}

function mergeCategoriesDatabase(cb) {
    // Merge the categories into the items database
    var sheetCategory, itemCards;
    var alias = 'categories';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    try { 
        sheetCategory = cfgsheet.db.getData('/');
        itemCards = cfgitem.db.getData('/');
    } catch(err) {
        var error = new MinionError(minionName, 'Chef can not get category sheet and/or items db', 101, err);
        cb(error);
        return;
    }

    var icards = Object.keys(itemCards);
    icards.forEach(function(idCard) {
        let itemCategory = itemCards[idCard].sheet.Category;
        itemCards[idCard].category = sheetCategory[itemCategory].sheet;
    });
    
    cfgitem.db.push('/', itemCards);

    cb(null, 'Chef merged category info into Item database');

}

function mergeGuestAuctionDatabase(cb) {
    // Merge the autioneer into the items database
    var sheetAuctioneer, guestCards;
    var alias = 'auctioneer';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgguest = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    try { 
        sheetAuctioneer = cfgsheet.db.getData('/');
        guestCards = cfgguest.db.getData('/');
    } catch(err) {
        var error = new MinionError(minionName, 'Chef can not get auction sheet and/or guest db', 101, err);
        cb(error);
        return;
    }

    var gcards = Object.keys(guestCards);
    gcards.forEach(function(idCard) {
        guestCards[idCard].auction = sheetAuctioneer[idCard].sheet;
    });
    
    cfgguest.db.push('/', guestCards);

    // Clear the auctioneer database
    cfgsheet.db.push('/', {});

    cb(null, 'Chef merged auction info into Guest database');
}

function mergeItemAuctionDatabase(cb) {
    // Merge the categories into the items database
    var sheetAuction, itemCards;
    var alias = 'itemauctioninfo';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    try { 
        sheetAuction = cfgsheet.db.getData('/');
        itemCards = cfgitem.db.getData('/');
    } catch(err) {
        var error = new MinionError(minionName, 'Chef can not get auctioninfo sheet and/or items db', 101, err);
        cb(error);
        return;
    }

    var icards = Object.keys(itemCards);
    icards.forEach(function(idCard) {
        itemCards[idCard].auction = sheetAuction[idCard].sheet;
    });
    
    cfgitem.db.push('/', itemCards);

    // Clear the item auction info db
    cfgsheet.db.push('/', {});

    cb(null, 'Chef merged auction info into Item database');
}

function removeMergedDatabases(cb) {
    var removedDbs = [];
    web.cfg.spreadsheets.sheets.forEach((sheet) => {
        if (sheet.remove && sheet.remove === true) {
            removedDbs.push(path.basename(sheet.db.filename));
            fs.unlinkSync(sheet.db.filename);
            sheet.db = null;
        }
    });
    
    web.cfg.spreadsheets.sheets = 
        web.cfg.spreadsheets.sheets.filter(s => s.db !== null);

    cb(null, 'Chef deleted files ' + removedDbs.join(', '));
}

Chef.prototype.mergeDatabases = function mergeDatabases(cb) {
    async.series([
        (callback) => {mergeTrelloGuestDatabase(callback);},
        (callback) => {mergeTrelloItemDatabase(callback);},
        (callback) => {mergeCategoriesDatabase(callback);},
        (callback) => {mergeGuestAuctionDatabase(callback);},
        (callback) => {mergeItemAuctionDatabase(callback);},
        (callback) => {removeMergedDatabases(callback);},
    ], (err, results) => {cb(err, results);});
};

Chef.prototype.onServeAuctioneer = function onServeAuctioneer(req, res, next, prayer) {
    var boardAlias = prayer.resource.split('/')[3];
    var datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === boardAlias);
    try { // Remove the '/boss/clerk/alias' from resource to get the DB path
        var dataPath = prayer.resource.split('/').slice(4).join('/');
        prayer.data = datastore.db.getData('/' + dataPath);
    } catch(err) {
        var error = new MinionError(minionName, 'Chef can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    web.sendJson(null, res, prayer);
};



module.exports = Chef;
    
})();