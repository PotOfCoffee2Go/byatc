'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = require('path').basename(__filename).replace('.js', '');


// Express web server and boss for this minion
var web = null, boss = null;

module.exports = {

    gear: function(myWeb) {web = myWeb; boss = web.boss;},
    
    
    onGetDb: function onGetDb(req, res, next, cb) {
        var minion = web.minion;
        var fullUrl = minion.angel.getNodejsURL(req, res, next);
        // Remove the '/boss/clerk/' part - what is left references the object in the DB
        var resource = '/' + fullUrl.pathname.split('/').slice(4).join('/');
        // Send the prayer to the requester
        var prayer = {}, data = {}, error = null;
        try {
            data =  web.cfg.trello.db.getData(resource);
            prayer = minion.angel.prayer(minionName, fullUrl.pathname, data, fullUrl.href);
        } catch(err) {
            error = new MinionError(web.boss, minionName, "Can't get data from Db", 101, err);
            //error.inner = err;
            return next(error);
        }
        if (cb) cb(error, prayer);
        return prayer;
    }
};


    
})();