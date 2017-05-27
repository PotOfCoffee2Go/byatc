/*
 * /bosses/cyborg/app.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file pulls the source data from Google Sheets and
 * creates/updates/synchronizes Trello Boards and the server
 * side files required by the byatec auction system.
 *
 * By specifing 'reload: false' in the /monarchy/queen.js
 * configuration the system will use the files that already
 * exist on the server.
 *
 */

'use strict';

(function() {

    const
        BOSS = 'cyborg',

        fs = require('fs-extra'),
        path = require('path'),
        async = require('async'),

        // Note: this object must be same in cyborg, ninja, and pirate app.js'
        boss = {
            name: BOSS,
            app: path.join(__dirname, '../'),
            dir: path.join(__dirname, ''),
            www: path.join(__dirname, '../../realms')
        };

    module.exports = {
        // Startup and create the objects for the 'cyborg' boss
        //  Note that the order of starting the machines up is important as they
        //   are adding app.get/post/etc routes to express, which is touchy
        //   about the order of said routes
        gearBoss: (web, bossName, cb) => {
            web.bosses[bossName] = boss;

            if (web.cfg.kingdom.reload) {
                // Clear the working database directory
                fs.emptyDirSync(web.dbdir);
            }

            // Start up tasks for this app
            //  Get data from Google Sheets and sync with Trello
            //  Add the RESTful paths that begin with '/cyborg/'
            async.series([
                callback => web.minion.constable.checkCredentials(boss, callback),
                callback => web.minion.constable.givePrincessSheetsCredentials(boss, callback),
                callback => web.minion.constable.givePrincessTrelloCredentials(boss, callback),
                callback => web.minion.architect.loadFromSources(boss, callback),
                callback => web.minion.angel.gearCyborgRestResources(boss, callback),
                callback => web.minion.crier.gearSockets(boss, callback),
                callback => web.minion.crier.relayQueenCommandToNinja(boss, callback),
                callback => web.minion.crier.relayQueenCommandToPirate(boss, callback),
            ], (err, results) => cb(err, results))
        }
    };

})();
