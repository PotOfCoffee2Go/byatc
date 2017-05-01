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
    website: 'https://byatc-potofcoffee2go.c9users.io',
//  website: 'https://byatc-potofcoffee2go.rhcloud.com',
    reload: true, // Use existing files
    keys: {
        sheets: {
            clientSecret: '',
            token: ''
        },
        trello: {
            key: '',
            token: ''
        },
        twitter: {
            key: '',
            sercret: '',
            access_token: '',
            access_token_secret: ''
        }
    } 
}

const // Modules
    util = require('util'),
    request = require('request');


function startBosses() {


    console.log('website is at: %s', kingdom.website);

    request({
        url:kingdom.website + '/queen/commands/cyborg/startMachines',
        method: 'POST',
        json: {kingdom:kingdom}},
        function (err,httpResponse,body) { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(util.inspect(body, { showHidden: false, depth: null }));
            }
        }
    );
}

startBosses();

//process.exit(0);

