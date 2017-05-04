'use strict';

(function() {

    const
        BOSS = 'ninja',

        fs = require('fs-extra'),
        path = require('path'),
        async = require('async'),

        // Note: this object must be same in cyborg, ninja, and pirate app.js'
        boss = {
            name: BOSS,
            app: path.join(__dirname, '../'),
            dir: path.join(__dirname, ''),
            www: path.join(__dirname, '../www'),
            dbdir: path.join(__dirname, '../www/docs/' + BOSS + '/db')
        };

    // Commands from the queen
    module.exports = {

        // Make some steam and start up the machines!
        //  Note that the order of starting the machines up is important as they
        //   are adding app.get/post/etc routes to express, which is touchy
        //   about the order of said routes
        gearBoss: (web, bossName, cb) => {
            web.bosses[bossName] = boss;

            // Clear the boss working database directory
            fs.emptyDirSync(boss.dbdir);

            async.series([
                callback => web.minion.constable.checkCredentials(boss, callback),
                callback => web.minion.architect.gearAuction(boss, callback),
                callback => web.minion.angel.gearNinjaRestResources(callback),
            ], (err, results) => cb(err, results));
        }
    };

})();
