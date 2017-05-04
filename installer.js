/*
 * /installer.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file installs the nodejs modules required of the
 * byatec auction system.
 * The file is started by npm given 'npm install' command
 * from the project directory.
 *
 */

'use strict';

const spawnSync = require('child_process').spawnSync;

console.log('');
console.log('Install byatc monarchy');
console.log('');
spawnSync('npm', ['i'], {
  env: process.env,
  cwd: './monarchy',
  stdio: 'inherit'
});

console.log('');
console.log('Install byatc bosses');
console.log('');
spawnSync('npm', ['i'], {
  env: process.env,
  cwd: './bosses',
  stdio: 'inherit'
});

console.log('');
console.log('Install byatc minions');
console.log('');
spawnSync('npm', ['i'], {
  env: process.env,
  cwd: './minions',
  stdio: 'inherit'
});


const fs = require('fs-extra');

function checkErr(err) {
  if (err) return console.error(err);
  console.log('success!');
};

console.log('');
console.log('Copy readme.md files to byatc server bosses/www directory with overwrite');
console.log('');
fs.copySync('./readme.md', './bosses/www/docs/index.md', {
  overwrite: true
}, checkErr);
console.log('');
