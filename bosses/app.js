'use strict';

(function () {

var machineryRunning = false;

// Get Web Site root directory
var webSitesRootPath = require('path').resolve(__dirname + '/www');

/// Commands from the queen
var asTheQueenCommands = {
    
    /// Make some steam and start up the machines!
    //  Note that the order of starting the machines up is important as they
    //   are adding app.get/post/etc routes to express, which is touchy
    //   about the order of said routes
    startMachines: function startMachines(boss) {  
        const architect = web.minion.architect;

        if (machineryRunning) {
            return 'Boss ' + boss + ' *bows* sorry my Majesty! ' +
                'already at full steam';
        }
    
        architect.gearBoss(boss);

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
        
        machineryRunning = true;
    
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

