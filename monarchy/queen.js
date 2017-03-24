'use strict';
/*
DO NOT MODIFY THIS FILE IN THE REPO!

Copy into a directory on your LOCAL MACHINE which has nodejs installed.
Edit the bosses https:// web addresses and keys into the kingdom object below
Save and run 'npm install request' from a command prompt
$ npm install request

Just ignore warnings at the end - npm bitching about not seeing a 'package.json'

Run queen.js from command prompt on your local machine which sends a request
to 'cyborg' to start up - cyborg broadcasts the message to the other
bosses for them to start up as well.

$ node queen

Thus, the only place where the keys to the kingdom reside is in
    your personal copy of queen.js on your local machine ;)

Keep this copy safe from prying eyes and for goodness sake use https on the
servers. Always!

*/

var kingdom = {
    websites: {
        cyborg: '',
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

    console.log('cyborg is at: %s', kingdom.websites.cyborg);
    console.log('ninja  is at: %s', kingdom.websites.ninja);
    console.log('pirate is at: %s', kingdom.websites.pirate);

    request({
        url:kingdom.websites.cyborg + '/queen/commands/startMachines',
        method: 'POST',
        json: {kingdom:kingdom}
        }, (err,httpResponse,body) => { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(body);
            }
        }
    );
}

startBosses();


