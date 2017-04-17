'use strict';

(function () {

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'clerk';


// Expressjs web server
var web = null;

function Clerk (Web) {
    web = Web;
}

Clerk.prototype.onGetFromSheetsDb = function onGetFromSheetsDb(req, res, next, prayer) {
    var sheetAlias = prayer.resource.split('/')[3];
    var datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
    try { // Remove the '/boss/clerk/alias' from resource to get the DB path
        var dataPath = prayer.resource.split('/').slice(4).join('/');
        prayer.data = datastore.db.getData('/' + dataPath);
    } catch(err) {
        var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    web.sendJson(null, res, prayer);
};

Clerk.prototype.onPostToSheetsDb = function onPostToSheetsDb(req, res, next, prayer) {
    console.log(prayer.resource);
    console.log(req.body);prayer.resource
    prayer.data = 'clerk post';
    web.sendJson(null, res, prayer);
    return;
    
    var sheetAlias = prayer.resource.split('/')[3];
    var datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
    try { // Remove the '/boss/clerk/alias' from resource to get the DB path
        var dataPath = prayer.resource.split('/').slice(4).join('/');
        prayer.data = datastore.db.getData('/' + dataPath);
    } catch(err) {
        var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    web.sendJson(null, res, prayer);
};


Clerk.prototype.onDeleteFromSheetsDb = function onDeleteFromSheetsDb(req, res, next, prayer) {
    console.log(prayer.resource);
    console.log(req.body);prayer.resource
    prayer.data = 'clerk delete';
    web.sendJson(null, res, prayer);
    return;
    
    var sheetAlias = prayer.resource.split('/')[3];
    var datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
    try { // Remove the '/boss/clerk/alias' from resource to get the DB path
        var dataPath = prayer.resource.split('/').slice(4).join('/');
        prayer.data = datastore.db.getData('/' + dataPath);
    } catch(err) {
        var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
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

module.exports = Clerk;
    
})();