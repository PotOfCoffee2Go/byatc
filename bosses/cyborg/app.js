'use strict';

(function () {

const
    fs = require('fs-extra'),
    util = require('util'),
    path = require('path'),
    async = require('async'),

    // Note: this object must be appropriately same in cyborg, ninja, and pirate app.js'
    boss = {
        name: 'cyborg',
        app: path.join(__dirname,'../'),
        dir: path.join(__dirname, ''),
        www: path.join(__dirname,'../www'),
        dbdir : path.join(__dirname,'../www/docs/cyborg/db')
    };

/// Commands from the queen
module.exports = {
    
    /// Make some steam and start up the machines!
    gearBoss: function gearBoss(web, bossName, cb) {  
        web.bosses[bossName] = boss;

        // Clear the boss working database directory
        fs.emptyDirSync(boss.dbdir);

        // Start up tasks which this boss is responible
        async.series([
            (callback) => {web.minion.constable.checkCredentials(boss, callback);},
            (callback) => {web.minion.architect.rousePrincessTrello(callback);},
            (callback) => {web.minion.architect.gearSheets(boss, callback);},
            (callback) => {web.minion.architect.gearTrello(boss, callback);},
            (callback) => {web.minion.clerk.gearDatabases(callback);},
            (callback) => {web.minion.architect.gearTrelloBoards(callback);},
            (callback) => {web.minion.angel.gearCyborgRestResources(boss, callback);},
            
            (callback) => {web.minion.crier.relayQueenCommandToNinja(boss, callback);},
            (callback) => {web.minion.crier.relayQueenCommandToPirate(boss, callback);},
        ], (err, results) => {cb(err, results);});
    }
};

})();
