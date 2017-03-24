const spawnSync = require('child_process').spawnSync;

console.log('Install byatc bosses');
spawnSync('npm', ['i'], { env: process.env, cwd:'./bosses', stdio: 'inherit' });
console.log('');console.log('Install byatc minions');console.log('');
spawnSync('npm', ['i'], { env: process.env, cwd:'./minions', stdio: 'inherit' });

const fs = require('fs-extra');
function checkErr(err) {
  if (err) return console.error(err);
  console.log('success!');
};

console.log(''); console.log('Copy readme.md files to byatc server bosses/www directory with overwrite');console.log('');
fs.copySync('./readme.md', './bosses/www/docs/index.md', {overwrite: true}, checkErr);
fs.copySync('./bosses/cyborg/readme.md', './bosses/www/docs/cyborg/index.md', {overwrite: true}, checkErr);
fs.copySync('./bosses/ninja/readme.md', './bosses/www/docs/ninja/index.md', {overwrite: true}, checkErr);
fs.copySync('./bosses/pirate/readme.md', './bosses/www/docs/pirate/index.md', {overwrite: true}, checkErr);
console.log('');
