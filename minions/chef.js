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

    // Merge the trello item information into the item database 
    var alias = 'items', sheetItems, boardItems, error;

    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetItems = cfgsheet.db.getData('/cards');
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
            cfgsheet.db.push('/cards/' + boardId, sheetItems[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);

    // Merge the trello guest information into the guest database 
    var sheetGuests, boardGuests;
    alias = 'guests';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { 
        sheetGuests = cfgsheet.db.getData('/cards');
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
            cfgsheet.db.push('/cards/' + boardId, sheetGuests[boardId]);
        }
    });
    // Clear the trello board item db
    cfgboard.db.push('/cards', []);

    // Merge the categories into the items database
    var sheetCategory, itemCards;
    alias = 'category';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgitem = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    try { 
        sheetCategory = cfgsheet.db.getData('/cards');
        itemCards = cfgitem.db.getData('/cards');
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
    
    cfgitem.db.push('/cards', itemCards);
    // Clear the category database board item db
    cfgsheet.db.push('/', {});

    if (cb) cb(null, {mergeDatabases: 'complete'});
};


module.exports = Chef;
    
})();