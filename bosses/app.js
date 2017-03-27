'use strict';

(function () {

const
    path = require('path')


var boss = function(bossName) {
    // Empty or create boss database directory
    var 
        bossDir = path.join(__dirname,'../bosses/', bossName),
        bossWww = path.join(__dirname,'../bosses/www');
        
    return {name: bossName, dir: bossDir, www: bossWww};
};
            
var bosses = {};

// Get Web Site root directory
var webSitesRootPath = require('path').resolve(__dirname + '/www');

/// Commands from the queen
var asTheQueenCommands = {
    
    /// Make some steam and start up the machines!
    //  Note that the order of starting the machines up is important as they
    //   are adding app.get/post/etc routes to express, which is touchy
    //   about the order of said routes
    startMachines: function startMachines(bossName) {  
        const architect = web.minion.architect;

        if (bosses[bossName]) {
            return 'Boss ' + bossName + ' *bows* sorry my Majesty! ' +
                'already at full steam';
        }

        bosses[boss] = boss(bossName);
        
        architect.gearBoss(bosses[boss]);

        var reply = 'Boss ' + boss + ' *bows* starting up machinery My Queen!';
        console.log(reply);
        return reply; 
    }
};


/// Spark up boss's web server and architect
const web = require('./#gearing/server')(asTheQueenCommands);

/// Gear up Web Sites, API docs, html pages, js, css, etc. hosted by this server
web.minion.architect.gearWebSites(webSitesRootPath);

console.log('Core server loaded');
    
// Listen for requests from Her Majesty
web.listen();

})();

