/*
 * /monarchy/queen.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file holds the credentials to web based services and
 * sends RESTful request to start up the auction system by
 * providing those credentials. The file runs from the auction
 * administrator's local machine to insure the security of the
 * keys, tokens, and secrets of the web services.
 *
 */

/*
DO NOT MODIFY THIS FILE IN THE REPO!
Copy into a directory on your LOCAL MACHINE
Place the bosses web addresses and keys into the kingdom below - save
Thus, the only place where the keys to the kingdom reside is in
    this copy of queen.js on your local machine ;)

Run from command prompt on your local machine to start up the bosses
ex: $ node queen
*/

'use strict';

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
            secret: '',
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
            url: kingdom.website + '/queen/commands/cyborg/startMachines',
            method: 'POST',
            json: {
                kingdom: kingdom
            }
        },
        function(err, httpResponse, body) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
            }
        }
    );
}

startBosses();

