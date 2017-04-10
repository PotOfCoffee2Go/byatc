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

// Sync Trello Boards with Spreadsheet Sheets
Chef.prototype.mergeDatabases = function mergeDatabases(boss, cb) {
    var alias = 'items', sheetItems, boardItems, error;

    var cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    var cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { // Remove the '/boss/clerk/trello/boardalias' from resource to get the path
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

    var sheetGuests, boardGuests;
    alias = 'guests';
    
    cfgsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
    cfgboard = web.cfg.trello.boards.find(b => b.alias === alias);
    try { // Remove the '/boss/clerk/trello/boardalias' from resource to get the path
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
    if (cb) cb(null, {mergeDatabases: 'complete'});
};


module.exports = Chef;
    
})();