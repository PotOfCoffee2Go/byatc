'use strict';

(function () {

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = require('path').basename(__filename).replace('.js', '');

// Express web server and boss for this minion
var web = null, boss = null;

function setQueensCredentials(creds) {
    if (web.cfg.trello) {
    }
    if (web.cfg.sheets) {
    }
}

function checkBossCredentials() {
    if (web.cfg.trello) {
        if (!process.env.TRELLO_TOKEN || !process.env.TRELLO_TOKEN) {
            throw (new Error('Trello Key/Token not in environment'));
        }
    }
    if (web.cfg.sheets) {
        if (!process.env.SHEETS_CLIENT_SECRET || !process.env.SHEETS_TOKEN) {
            throw (new Error('Sheets clientSecret/Token not in environment'));
        }
    }
}




module.exports = {

    gear: function(myWeb) {web = myWeb; boss = web.boss;},
    
    checkBossCredentials: checkBossCredentials
};
    
    
})();