/*
 * /launch.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file is currently not used - may be removed. Stay tuned.
 *
 */

'use strict';

require('pkginfo')(module, 'name', 'version', 'description');

const launcher = require('commander');

launcher
      .version(module.exports.name + ' launch v' + module.exports.version)
      .usage('cyborg|ninja|pirate [options]')
      .option('-I, --ip', 'Server ip address')
      .option('-P, --port', 'Server port')
      .option('-K, --key', 'Server Trello authentication key')
      .option('-T, --token', 'Server Trello authentication token')
      .parse(process.argv);

if (launcher.args.length !== 1 || ['cyborg', 'ninja', 'pirate'].indexOf(launcher.args[0]) < 0) {
      launcher.outputHelp();
      console.error('Invalid request! Require cyborg, ninja, or pirate as the server to be started');
      console.error();
      process.exit(1);
}



if (launcher.ip) console.log('Server IP address %s', launcher.ip);
if (launcher.port) console.log('Server port %s', launcher.port);
