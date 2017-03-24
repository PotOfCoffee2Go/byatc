'use strict';

(function (){

const // Modules
    request = require('request'),
    fs = require('fs-extra');

const  // Get the web address from environment variables
    cyborg = process.env.BYATC_CYBORG_WEBADDRESS,
    ninja = process.env.BYATC_NINJA_WEBADDRESS,
    pirate = process.env.BYATC_PIRATE_WEBADDRESS

console.log('cyborg is at: %s', cyborg);
console.log('ninja  is at: %s', ninja);
console.log('pirate is at: %s', pirate);

function startBosses() {
    
    request(cyborg + '/queen/commands/startMachines', function(err, response, body) {
        if (err)
            console.log('Boss cyborg ' + err);
        else
            console.log(body);
    });
}

startBosses();

process.exit(0);

})();