'use strict';

(function () {

const
    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'clerk';


// Expressjs web server
var web = null;
var guestList, itemList;

function Clerk (Web) {
    web = Web;
}

Clerk.prototype.setGuestList = function setGuestList(list) {guestList = list;};
Clerk.prototype.setItemList = function setItemList(list) {itemList = list;};

Clerk.prototype.onPostToSheetsDb = function onPostToSheetsDb(req, res, next, prayer) {
    var
        data = null,
        newData = req.body.data,
        pathList = prayer.resource.split('/'),
        datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === pathList[3]), // guests,items,categories
        dataPath = '/' + pathList.slice(4, pathList.length - 1).join('/');
    try {
        data = datastore.db.getData(dataPath);
        data[pathList[pathList.length-1]] = newData;
        datastore.db.push(dataPath, data);
    } catch(err) {
        var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    prayer.data = newData;
    web.sendJson(null, res, prayer);
};


Clerk.prototype.onDeleteFromSheetsDb = function onDeleteFromSheetsDb(req, res, next, prayer) {
    var
        data = null,
        pathList = prayer.resource.split('/'),
        datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === pathList[3]), // guests,items,categories
        dataPath = '/' + pathList.slice(4, pathList.length - 1).join('/');
    try {
        data = datastore.db.getData(dataPath);
        delete data[pathList[pathList.length-1]];
        datastore.db.push(dataPath, data);
    } catch(err) {
        var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    prayer.data = data;
    web.sendJson(null, res, prayer);
};


Clerk.prototype.onGetAuctionRows = function onGetAuctionRows(req, res, next, prayer) {
    var alias = prayer.resource.split('/')[3] + '/' + prayer.resource.split('/')[4];
    var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    if (sheet === undefined || !sheet.rows) {
        var error = new MinionError(minionName, 'Can not get rows from sheet', 101, null);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    prayer.data = sheet.rows;
    web.sendJson(null, res, prayer);
};


Clerk.prototype.onBid = function onBid(req, res, next, prayer) {
    var error, ge, ie;
    var guestsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/guests');
    var itemsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/items');

    try {
        ge = guestsheet.fields;
        ie = itemsheet.fields;
        var guest = guestsheet.find(g => g[0] === req.body.guestid);
        var item = itemsheet.find(i => i[0] === req.body.itemid);
        
        if (!item[ie.Ready]) {
            error = new MinionError(minionName, 'This item is not open for bidding', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        
        if (item[ie.BuyNowOnly]) {
            error = new MinionError(minionName, 'This item is buy only', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        
        if (item[ie.QtyLeft] < 1) {
            error = new MinionError(minionName, 'This item has already been sold', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        
        if (req.body.amount >= (item[ie.CurrentBid] + item[ie.Increment])) {
            item[ie.CurrentBid] = req.body.amount;
            item[ie.Bidder] = req.body.guestid;
            guest[ge.bids]++;
            web.sendJson(null, res, prayer);
            return;
        }
        else {
            error = new MinionError(minionName, 'Invalid bid amount - must be current bid + increment (or higher)', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
    }
    catch(err) {
        error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
};


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
        error = new MinionError(minionName, 'Clerk can not get guest sheets and/or board data from Dbs', 101, err);
        cb(error);
        return;
    }

    boardGuests.forEach(function (boardGuest) {
        let labels = {};
        boardGuest.labels.forEach((label) => {
            delete label.uses;
            labels[label.color] = label;
        });
        delete labels.uses;
        boardGuest.labels = labels;
        
        let attached = {};
        boardGuest.attachments.forEach((attach) => {
            attached[attach.name] = {name: attach.name, url: attach.url};
        });
        delete boardGuest.attachments;
        boardGuest.attached = attached;
        
        let boardId = boardGuest.name.split(' ')[0];
        if(sheetGuests[boardId]) {
            sheetGuests[boardId].trello = boardGuest;
            cfgsheet.db.push('/' + boardId, sheetGuests[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);

    // Clear the auction rows - will not be used
    cfgsheet.rows = null;
    
    cb(null, 'Clerk merged trello info into Guest database');
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
        error = new MinionError(minionName, 'Clerk can not get item sheets and/or board data from Dbs', 101, err);
        cb(error);
        return;
    }

    boardItems.forEach(function (boardItem) {
        let labels = {};
        boardItem.labels.forEach((label) => {
            delete label.uses;
            labels[label.color] = label;
        });
        delete labels.uses;
        boardItem.labels = labels;
        
        let attached = {};
        boardItem.attachments.forEach((attach) => {
            attached[attach.name] = {name: attach.name, url: attach.url};
        });
        delete boardItem.attachments;
        boardItem.attached = attached;
        
        let boardId = boardItem.name.split(' ')[0];
        if(sheetItems[boardId]) {
            sheetItems[boardId].trello = boardItem;
            cfgsheet.db.push('/' + boardId, sheetItems[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);
    
    // Clear the auction rows - will not be used
    cfgsheet.rows = null;
    
    cb(null, 'Clerk merged trello info into Item database');
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
        var error = new MinionError(minionName, 'Clerk can not get category sheet and/or items db', 101, err);
        cb(error);
        return;
    }

    var icards = Object.keys(itemCards);
    icards.forEach(function(idCard) {
        let itemCategory = itemCards[idCard].google.Category;
        itemCards[idCard].category = sheetCategory[itemCategory].google;
    });
    
    cfgitem.db.push('/', itemCards);

    // Clear the auction rows - will not be used
    cfgsheet.rows = null;
    
    cb(null, 'Clerk merged category info into Item database');

}

function mergeGuestAuctionDatabase(cb) {
    // Merge the autioneer into the items database
    var sheetAuctioneer, guestCards;
    var alias = 'auction/guests';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgguest = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    try { 
        sheetAuctioneer = cfgsheet.db.getData('/');
        guestCards = cfgguest.db.getData('/');
    } catch(err) {
        var error = new MinionError(minionName, 'Clerk can not get auction sheet and/or guest db', 101, err);
        cb(error);
        return;
    }

    var gcards = Object.keys(guestCards);
    gcards.forEach(function(idCard) {
        guestCards[idCard].auction = sheetAuctioneer[idCard].google;
    });
    
    cfgguest.db.push('/', guestCards);

    // Clear the auctioneer database
    cfgsheet.db.push('/', {});

    cb(null, 'Clerk merged auction info into Guest database');
}

function mergeItemAuctionDatabase(cb) {
    // Merge the categories into the items database
    var sheetAuction, itemCards;
    var alias = 'auction/items';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    try { 
        sheetAuction = cfgsheet.db.getData('/');
        itemCards = cfgitem.db.getData('/');
    } catch(err) {
        var error = new MinionError(minionName, 'Clerk can not get auctioninfo sheet and/or items db', 101, err);
        cb(error);
        return;
    }

    var icards = Object.keys(itemCards);
    icards.forEach(function(idCard) {
        itemCards[idCard].auction = sheetAuction[idCard].google;
    });
    
    cfgitem.db.push('/', itemCards);

    // Clear the item auction info db
    cfgsheet.db.push('/', {});

    cb(null, 'Clerk merged auction info into Item database');
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
    
    cb(null, 'Clerk deleted merged auction info databases ' + removedDbs.join(', '));
}


Clerk.prototype.gearDatabases = function gearDatabases(cb) {
    async.series([
        (callback) => {mergeTrelloGuestDatabase(callback);},
        (callback) => {mergeTrelloItemDatabase(callback);},
        (callback) => {mergeCategoriesDatabase(callback);},
        (callback) => {mergeGuestAuctionDatabase(callback);},
        (callback) => {mergeItemAuctionDatabase(callback);},
        (callback) => {removeMergedDatabases(callback);},
    ], (err, results) => {cb(err, results);});
};


module.exports = Clerk;
    
})();