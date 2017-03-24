'use strict';

(function () {

var machineryRunning = false;

// Get this boss directory and Web Site root directory
var bossDir = __dirname.split('/'), boss = bossDir[bossDir.length-1],
    bossWebSitesRootPath = bossDir.join('/') + '/www';
    
/// Commands from the queen
var asTheQueenCommands = {
    
    /// Make some steam and start up the machines!
    //  Note that the order of starting the machines up is important as they
    //   are adding app.get/post/etc routes to express, which is touchy
    //   about the order of said routes
    startMachines: function startMachines() {  
    
        if (machineryRunning) {
            return 'Boss ' + boss + ' *bows* sorry my Queen! ' +
                'already at full steam';
        }
    
        // Check enviroment variables for the credential
        //   keys/tokens and such to our friends at Trello and Google Sheet 
        web.minion.constable.checkBossCredentials();
        
        /// WebSocket Interface
        architect.gearWebsockets();
        
        /// Intercom communication between bosses
        architect.gearIntercom();
        
        /// Interface to Trello boards
        architect.gearTrello();
        
        /// Interface to Google sheets
        architect.gearSheets();
        
        // Have architect start up the mechanisms created
        architect.activateMachinery();
    
        /// Error Handling of REST API machinery
        architect.gearRestErrorHandler();
        
        /// Gear up Web Sites, API docs, html pages, js, css, etc. hosted by this server
        architect.gearWebSites(bossWebSitesRootPath);
        
        machineryRunning = true;
    
        var reply = 'Boss ' + boss + ' *bows* starting up machinery My Queen!';
        console.log(reply);
        return reply; 
    }
};


/// Spark up boss's web server and architect
const
    web = require('../#gearing/server')(boss, asTheQueenCommands),
    architect = web.minion.architect;

/// First thing! Tell architect to gear the minions to this express server
architect.gearMinions(web);

console.log('Boss %s and minions geared up', boss);

// Listen/wait for requests from Her Majesty
web.listen();

})();

