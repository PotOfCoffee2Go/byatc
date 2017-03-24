'use strict';

(function (){

const
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = require('path').basename(__filename).replace('.js', '');

// Express web server and boss for this minion
var web = null, boss = null;

module.exports = {

gear: function(myWeb) {web = myWeb; boss = web.boss;},
    
};    
    
})();