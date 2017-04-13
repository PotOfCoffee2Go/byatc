'use strict';

(function () {

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'constable';

// Express web server and boss for this minion
var web = null;

function Constable (Web) {
    web = Web;
}


Constable.prototype.setQueensCredentials = function setQueensCredentials(creds) {
};

Constable.prototype.checkBossCredentials = function checkBossCredentials() {
    if (!web.cfg.kingdom.keys || !web.cfg.kingdom.keys.trello || 
        !web.cfg.kingdom.keys.trello.key.length > 5 || !web.cfg.kingdom.keys.trello.token.length > 5) {
            throw (new Error('Trello Key/Token not in Kingdom Keys'));
    }
}

module.exports = Constable;

    
})();