'use strict';
/*
DO NOT MODIFY THIS FILE IN THE REPO!

Copy 'queen.js' into a directory on your LOCAL MACHINE which has node installed
  (https://nodejs.org/en/)

Place the bosses web addresses and keys into the kingdom object below - save
Thus, the only place where the keys to the kingdom reside is in
    your copy of queen.js on your local machine ;)

From a command prompt in the directory you put 'queen.js' - run
$ npm install request

Then run from command prompt when ready to start up the bosses (advisors?)

$ node queen

You should see a messge indicating the system is running or error message if
one has occured.

Note: If you believe the keys have been compromised - log onto Trello, Google
  Sheets, Twitter, etc and remove 'byatc auction system' from your 'app'
  authorization list and re-authenticate with a new set of credentials.

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
            clientSecret: '',
            token: ''
        }
    } 
}

const // Modules
    request = require('request');


function startAdvisors() {


    console.log('cyborg is at: %s', kingdom.websites.cyborg);
    console.log('ninja  is at: %s', kingdom.websites.ninja);
    console.log('pirate is at: %s', kingdom.websites.pirate);

    request({
        url:kingdom.websites.cyborg + '/queen/commands/cyborg/startMachines',
        method: 'POST',
        json: {kingdom:kingdom}},
        function (err, httpResponse, body) { 
            if (err) {
                console.log(err);
            }
            else {
                console.log(body);
            }
        }
    );
}

startAdvisors();

