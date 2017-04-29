'use strict';

(function () {

const
    BOSS = 'cyborg',

    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),

    // Note: this object must be same in cyborg, ninja, and pirate app.js'
    boss = {
        name: BOSS,
        app: path.join(__dirname,'../'),
        dir: path.join(__dirname, ''),
        www: path.join(__dirname,'../www'),
        dbdir : path.join(__dirname,'../www/docs/' + BOSS + '/db')
    };

// Commands from the queen
module.exports = {
    
    // Make some steam and start up the machines!
    gearBoss: (web, bossName, cb) => {  
        web.bosses[bossName] = boss;

        // Start up tasks which this boss is responible
        async.series([
            callback => web.minion.constable.checkCredentials(boss, callback),
            callback => web.minion.architect.loadFromSources(boss, callback),
            callback => web.minion.angel.gearCyborgRestResources(boss, callback),
            callback => web.minion.crier.gearSockets(boss, callback),
            callback => web.minion.crier.relayQueenCommandToNinja(boss, callback),
            callback => web.minion.crier.relayQueenCommandToPirate(boss, callback),
        ], (err, results) => cb(err, results))
    }
};

})();
