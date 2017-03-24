'use strict';
/*
DO NOT MODIFY THIS FILE IN THE REPO!
Copy into a directory on your LOCAL MACHINE
Place the bosses web addresses and keys into the kingdom below - save
Thus, the only place where the keys to the kingdom reside is in
    this copy of queen.js on your local machine ;)

Run from command prompt on your local machine to start up the bosses
ex: $ node queen
*/

var kingdom = {
    websites: {
        cyborg: 'https://byatc-potofcoffee2go.c9users.io',
        ninja: '',
        pirate: ''
    },
    keys: {
        trello: {
            key: '',
            token: ''
        },
        sheets: {
            client_secret: '',
            token: ''
        }
    }
    
};

const // Modules
    request = require('request');


function startBosses() {

request({
    url: 'https://byatc-potofcoffee2go.c9users.io/version',
    method: 'GET'},
        function (err,httpResponse,body) { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(body);
            }
        }
    );    


    console.log('cyborg is at: %s', kingdom.websites.cyborg);
    console.log('ninja  is at: %s', kingdom.websites.ninja);
    console.log('pirate is at: %s', kingdom.websites.pirate);
/*
    request({
        url:kingdom.websites.cyborg + '/queen/commands/startMachines',
        method: 'POST',
        json: {kingdom:kingdom},
        function (err,httpResponse,body) { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(body);
            }
        }
    }); */
}

startBosses();

//process.exit(0);
