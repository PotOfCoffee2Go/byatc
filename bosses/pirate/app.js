/*
 * /bosses/pirate/app.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file creates the files used by the auction system to
 * handle chat rooms and checkout. 
 *
 */

'use strict';

(function() {

    const
        BOSS = 'pirate',

        path = require('path'),
        async = require('async'),

        // Note: this object must be same in cyborg, ninja, and pirate app.js'
        boss = {
            name: BOSS,
            app: path.join(__dirname, '../'),
            dir: path.join(__dirname, ''),
            www: path.join(__dirname, '../../realms'),
            dbdir: path.join(__dirname, '../../realms/docs/' + BOSS + '/db')
        };

    module.exports = {
        // Startup and create the objects for the 'pirate' boss
        //  Note that the order of starting the machines up is important as they
        //   are adding app.get/post/etc routes to express, which is touchy
        //   about the order of said routes
        gearBoss: (web, bossName, cb) => {
            web.bosses[bossName] = boss;

            // Clear the boss working database directory
            // fs.emptyDirSync(boss.dbdir); // do not clear - keep existing messages

            // Setup the app chat system
            //  Add the RESTful paths that begin with '/pirate/'
            async.series([
                callback => web.minion.constable.checkCredentials(boss, callback),
                callback => web.minion.architect.gearChat(boss, callback),
                callback => web.minion.angel.gearPirateRestResources(boss, callback),
            ], (err, results) => cb(err, results));

        }
    };

})();
