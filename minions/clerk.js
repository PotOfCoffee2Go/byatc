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


Clerk.prototype.onGetDb = function onGetDb(req, res, next, prayer, cb) {
    var data = {}, error = null;
    try {
        data =  web.cfg.trello.db.getData(prayer.resource);
    } catch(err) {
        error = new MinionError(prayer.bossName, prayer.minionName, "Can't get data from Db", 101, err);
        error.prayer = prayer;
        //error.inner = err;
        return next(error);
    }
    prayer.data = data;
    if (cb) cb(error, prayer);
    else return prayer;
};

module.exports = Clerk;
    
})();