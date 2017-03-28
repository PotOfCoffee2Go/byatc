'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'clerk';


// Express web server and boss for this minion
var web = null;

function Clerk (bossWeb) {
    web = bossWeb;
}


Clerk.prototype.onGetTrelloDb = function onGetTrelloDb(req, res, next, prayer, cb) {
    var data = {}, error = null;
    try { // Remove the '/boss/clerk/dbname' from resource to get the path
        var dataPath = prayer.resource.split('/').slice(3).join('/');
        prayer.data = web.cfg.trello.db.getData(dataPath);
    } catch(err) {
        error = new MinionError('Can\'t get data from Db', 101, err);
        web.sendJson(res, null, web.minion.angel.errorPrayer(prayer, error));
        return;
    }
    if (cb)
        cb(error, prayer);
    else
        web.sendJson(res, null, prayer);
};

module.exports = Clerk;
    
})();