'use strict';

(function () {
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'crier';


// Expressjs web server
var web = null;
    
function Crier (Web) {
    web = Web;
}

module.exports = Crier;

})();