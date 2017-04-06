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


Clerk.prototype.onGetTrelloDb = function onGetTrelloDb(req, res, next, prayer, cb) {

    var error = null;
    var boardAlias = prayer.resource.split('/')[4];
    var board = web.cfg.trello.boards.find(b => b.alias === boardAlias);
    try { // Remove the '/boss/clerk/trello/boardalias' from resource to get the path
        var dataPath = prayer.resource.split('/').slice(5).join('/');
        prayer.data = board.db.getData('/' + dataPath);
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