/*
 * /bosses/app.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file is the main entry point to start up the byatec auction system
 *
 */

'use strict';

(function() {

    const
        util = require('util'),
        path = require('path'),

        cyborg = require('./cyborg/app'),
        ninja = require('./ninja/app'),
        pirate = require('./pirate/app');

    // Commands from Her Majesty
    // The server comes up with only access to the web sites.
    // Credentials to Google and Trello are provided by the queen.js
    //  program in the app /monarchy directory. These credentials are
    //  sent to startup the app
    var asHerMajestyCommands = {

        // Make some steam and start up the machines!
        startMachines: (bossName, cb) => {

            // Check to see if this Boss already geared up
            if (web.bosses[bossName]) {
                cb(null, 'Boss ' + bossName + ' *bows* sorry My Majesty! ' +
                    'I am already at full steam');
                return;
            }

            // Each boss creates (gears) objects used by that boss
            switch (bossName) {
                case 'cyborg':
                    // Note: cyborg will route the startMachines request to other
                    //  bosses and accumulate the results for display
                    cyborg.gearBoss(web, bossName, (err, results) => {
                        cb(err, results);
                        web.logger.info(util.inspect(results, {
                            showHidden: false,
                            depth: null
                        }));
                    });
                    break;
                case 'ninja': // Ninja (auction) startup
                    ninja.gearBoss(web, bossName, cb);
                    break;
                case 'pirate': // pirate (chat and checkout) startup
                    pirate.gearBoss(web, bossName, cb);
                    break;
                default:
                    cb(null, bossName + ' is not an advisor My Majesty!');
                    return;
            }
        }
    };

    // Spark up web server
    const web = require('./server')(asHerMajestyCommands);
    web.logger.info('Web Server created');

    // Gear up paths to Web Sites and Error handling 
    web.minion.angel.gearTrailingRoutes(path.resolve(__dirname + '/www'));
    web.logger.info('Default routes are active');

    // Listen for requests
    // REST commands not available until Her Majesty startMachines
    web.listen();

})();
