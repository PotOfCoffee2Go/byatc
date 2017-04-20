'use strict';

(function () {
const
    path = require('path'),
    request = require('request'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'crier';


// Expressjs web server
var web = null;
    
function Crier (Web) {
    web = Web;
}

Crier.prototype.relayQueenCommandToNinja = function relayQueenCommandToNinja(boss, cb) {
    var results = [boss.name + ' relay Her Majesty command to ninja'];
    request({
        url: web.cfg.kingdom.website + '/queen/commands/ninja/startMachines',
        method: 'POST',
        json: {kingdom: web.cfg.kingdom}},
        function (err, response, body) { 
            if (err) cb(err); 
            else {
                results.push(body);
                cb(null, results);
            }
        }
    
    );
};

Crier.prototype.relayQueenCommandToPirate = function relayQueenCommandToPirate(boss, cb) {
    var results = [boss.name + ' relay Her Majesty command to pirate'];
    request({
        url: web.cfg.kingdom.website + '/queen/commands/pirate/startMachines',
        method: 'POST',
        json: {kingdom: web.cfg.kingdom}},
        function (err, response, body) { 
            if (err) cb(err); 
            else {
                results.push(body);
                cb(null, results);
            }
        }
    
    );
};


module.exports = Crier;

})();