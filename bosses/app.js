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
            case 'cyborg': cyborg.gearBoss(web, bossName, (err, results) => {
                cb(err, results);
                web.winston.info(util.inspect(results, { showHidden: false, depth: null }));
            }); break;
            case 'ninja': ninja.gearBoss(web, bossName, cb); break;
            case 'pirate': pirate.gearBoss(web, bossName, cb); break;
            default: cb(null, bossName + ' is not an advisor My Majesty!'); return;
        }
    }
};


/// Spark up web server
const web = require('./server')(asTheQueenCommands);
web.winston.info('Web Server created');

/// Gear up paths to Default Web Site and Error handling 
web.minion.angel.gearTrailingRoutes(path.resolve(__dirname + '/www'));
web.winston.info('Default routes are active');


// Listen for requests from Her Majesty
web.listen();

})();

