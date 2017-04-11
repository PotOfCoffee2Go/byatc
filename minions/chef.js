'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'chef';

// Express web server and boss for this minion
var web = null;

function Chef (Web) {
    web = Web;
}

Chef.prototype.mergeDatabases = function mergeDatabases(boss, cb) {

    // Merge the trello guest information into the guest database 
    var sheetGuests, boardGuests, error;
    var alias = 'guests';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetGuests = cfgsheet.db.getData('/');
        boardGuests = cfgboard.db.getData('/cards');
    } catch(err) {
        error = new MinionError(minionName, 'Can not get guest sheets and/or board data from Dbs', 101, err);
        if (cb) cb(error);
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

    // Merge the trello item information into the item database 
    var sheetItems, boardItems;
    alias = 'items';
    
    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetItems = cfgsheet.db.getData('/');
        boardItems = cfgboard.db.getData('/cards');
    } catch(err) {
        error = new MinionError(minionName, 'Can not get item sheets and/or board data from Dbs', 101, err);
        if (cb) cb(error);
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


    // Merge the categories into the items database
    var sheetCategory, itemCards;
    alias = 'categories';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    try { 
        sheetCategory = cfgsheet.db.getData('/');
        itemCards = cfgitem.db.getData('/');
    } catch(err) {
        error = new MinionError(minionName, 'Can not get category sheet and/or items db', 101, err);
        if (cb) cb(error);
        return;
    }

    var icards = Object.keys(itemCards);
    icards.forEach(function(idCard) {
        let itemCategory = itemCards[idCard].sheet.Category;
        itemCards[idCard].category = sheetCategory[itemCategory].sheet;
    });
    
    cfgitem.db.push('/', itemCards);
    // Clear the category database board item db


    // Merge the autioneer into the items database
    var sheetAuctioneer, guestCards;
    alias = 'auctioneer';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgguest = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    try { 
        sheetAuctioneer = cfgsheet.db.getData('/');
        guestCards = cfgguest.db.getData('/');
    } catch(err) {
        error = new MinionError(minionName, 'Can not get auction sheet and/or guest db', 101, err);
        if (cb) cb(error);
        return;
    }

    var gcards = Object.keys(guestCards);
    gcards.forEach(function(idCard) {
        guestCards[idCard].auction = sheetAuctioneer[idCard].sheet;
    });
    
    cfgguest.db.push('/', guestCards);

    // Clear the auctioneer database
    cfgsheet.db.push('/', {});

    
    if (cb) cb(null, {mergeDatabases: 'complete'});
};


module.exports = Chef;
    
})();