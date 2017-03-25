'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'chef';

// Express web server and boss for this minion
var web = null;

function Chef (bossWeb) {
    web = bossWeb;
}


module.exports = Chef;
    
})();