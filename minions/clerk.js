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
    var guestsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/guests');
    var itemsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/items');
    var guest = guestsheet.find(g => g[0] === data.guestid);
    var item = guestsheet.find(i => i[0] === data.itemid);
    
    var ge = {
      'id': 0, 'fullname': 1, 'table': 2, 'player': 3, 'donor': 4, 'issues': 5, 'bidder': 6, 
      'winner': 7, 'paid': 8, 'delivered': 9, 'bids': 10, 'items_won': 11, 'amount_due': 12
    };
    var ie = {
      'id': 0, 'OpenBid': 1, 'Increment': 2, 'Quantity': 3, 'BuyNow': 4, 'BuyNowOnly': 5,
      'QuantitySold': 6
    };
    
    
    prayer.data = {yippie: 'got your bid!'};
    web.sendJson(null, res, prayer);
};

module.exports = Clerk;
    
})();