'use strict';

(function () {
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'cryer';


// Expressjs web server
var web = null;
    
function Cryer (Web) {
    web = Web;
}

module.exports = Cryer;

})();