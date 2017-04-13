'use strict';

(function () {

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'constable';

// Expressjs web server
var web = null;

function Constable (Web) {
    web = Web;
}


Constable.prototype.setQueensCredentials = function setQueensCredentials(creds) {
};

Constable.prototype.givePrincessSheetsCredentials = function givePrincessSheetsCredentials() {
    web.spreadsheets.setCredentials(web.cfg.kingdom.keys.sheets);
};

Constable.prototype.givePrincessTrelloCredentials = function givePrincessTrelloCredentials() {
    web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
    web.trello.setCredentials(web.cfg.kingdom.keys.trello);
};

Constable.prototype.checkBossCredentials = function checkBossCredentials() {
    if (!web.cfg.kingdom.keys || !web.cfg.kingdom.keys.trello || 
        !web.cfg.kingdom.keys.trello.key.length > 5 || !web.cfg.kingdom.keys.trello.token.length > 5) {
            throw (new Error('Trello Key/Token not in Kingdom Keys'));
    }
}

module.exports = Constable;

    
})();