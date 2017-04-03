'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'chef';

// Express web server and boss for this minion
var web = null;

function Chef (Web) {
    web = Web;
}


module.exports = Chef;
    
})();