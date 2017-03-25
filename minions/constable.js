'use strict';

(function () {

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'constable';

// Express web server and boss for this minion
var web = null;

function Constable (bossWeb) {
    web = bossWeb;
}


Constable.prototype.setQueensCredentials = function setQueensCredentials(creds) {
    if (web.cfg.trello) {
    }
    if (web.cfg.sheets) {
    }
}

Constable.prototype.checkBossCredentials = function checkBossCredentials() {
    if (web.cfg.trello) {
        if (!web.cfg.kingdom.keys || !web.cfg.kingdom.keys.trello || 
            !web.cfg.kingdom.keys.trello.key.length > 5 || !web.cfg.kingdom.keys.trello.token.length > 5) {
            throw (new Error('Trello Key/Token not in environment'));
        }
    }
    if (web.cfg.sheets) {
        if (!process.env.SHEETS_CLIENT_SECRET || !process.env.SHEETS_TOKEN) {
            throw (new Error('Sheets clientSecret/Token not in environment'));
        }
    }
}

module.exports = Constable;

    
})();