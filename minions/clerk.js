'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'clerk';


// Express web server and boss for this minion
var web = null;

function Clerk (Web) {
    web = Web;
}

Clerk.prototype.onGetFromSheetsDb = function onGetFromSheetsDb(req, res, next, prayer, cb) {
    var error = null;
    var boardAlias = prayer.resource.split('/')[3];
    var datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === boardAlias);
    try { // Remove the '/boss/clerk/trello/boardalias' from resource to get the path
        var dataPath = prayer.resource.split('/').slice(4).join('/');
        prayer.data = datastore.db.getData('/' + dataPath);
    } catch(err) {
        error = new MinionError(minionName, 'Can not get data from Db', 101, err);
        web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        return;
    }
    if (cb)
        cb(error, prayer);
    else
        web.sendJson(null, res, prayer);
};


module.exports = Clerk;
    
})();