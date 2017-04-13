'use strict';

(function () {

const
    util = require('util'),
    path = require('path'),

    cyborg = require('./cyborg/app'),
    ninja = require('./ninja/app'),
    pirate = require('./pirate/app');

/// Commands from the queen
var asTheQueenCommands = {
    
    /// Make some steam and start up the machines!
    startMachines: function startMachines(bossName, cb) {  

        // Boss already geared up
        if (web.bosses[bossName]) {
            cb(null, 'Boss ' + bossName + ' *bows* sorry My Majesty! ' +
                'I am already at full steam');
            return;
        }

        switch (bossName) {
            case 'cyborg': cyborg.gearBoss(web, bossName, cb); break;
            case 'ninja': ninja.gearBoss(web, bossName, cb); break;
            case 'pirate': pirate.gearBoss(web, bossName, cb); break;
            default: cb(null, bossName + ' is not an advisor My Majesty!'); return;
        }
    }
};


/// Spark up web server
const web = require('./server')(asTheQueenCommands);

/// Gear up Default Web Site holding system API docs, html pages, js, css, etc.
web.minion.architect.gearWebSites(path.resolve(__dirname + '/www'));

console.log('Web Server created');
    
// Listen for requests from Her Majesty
web.listen();

})();

