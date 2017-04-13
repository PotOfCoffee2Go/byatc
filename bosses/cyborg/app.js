'use strict';

(function () {

const
    fs = require('fs-extra'),
    util = require('util'),
    path = require('path'),
    async = require('async');

// Note: this object must be appropriately same in cyborg, ninja, and pirate app.js'
var boss = {
    name: 'cyborg',
    app: path.join(__dirname,'../'),
    dir: path.join(__dirname, ''),
    www: path.join(__dirname,'www')
}

/// Commands from the queen
module.exports = {
    
    /// Make some steam and start up the machines!
    //  Note that the order of starting the machines up is important as they
    //   are adding app.get/post/etc routes to express, which is touchy
    //   about the order of said routes
    gearBoss: function gearBoss(web, bossName, cb) {  
        web.bosses[boss] = boss;

        // Clear the boss working database directory
        fs.emptyDirSync(boss.dir + '/db');

        // Start up tasks which this boss is responible
        async.series([
            (callback) => {web.minion.constable.checkCredentials(callback);},
            (callback) => {web.minion.architect.rousePrincessTrello(callback);},
            (callback) => {web.minion.architect.gearSheets(boss, callback);},
            (callback) => {web.minion.architect.gearTrello(boss, callback);},
            (callback) => {web.minion.chef.mergeDatabases(callback);},
            (callback) => {web.minion.architect.syncTrelloBoards(callback);},
            (callback) => {web.minion.angel.assignRoutes(boss, callback);},
        ], (err, results) => {cb(err, results);});
    }
};

})();
