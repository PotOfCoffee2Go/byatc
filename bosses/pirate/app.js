'use strict';

(function () {

const
    fs = require('fs-extra'),
    util = require('util'),
    path = require('path'),
    async = require('async');

// Note: this object must be appropriately same in cyborg, ninja, and pirate app.js'
var boss = {
    name: 'pirate',
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
        const architect = web.minion.architect;

        web.bosses[boss] = boss;
        
        // Clear the boss working database directory
        fs.emptyDirSync(boss.dir + '/db');
    
        // Check enviroment variables for the credential keys/tokens and such
        web.minion.constable.checkBossCredentials(web.bosses[boss]);
        
    }
};

})();
