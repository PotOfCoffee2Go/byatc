'use strict';

(function (){
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = require('path').basename(__filename).replace('.js', '');


// Express web server and boss for this minion
var web = null, boss = null;

module.exports = {

    gear: function(myWeb) {web = myWeb; boss = web.boss;},
    
    criticalRestCare: function criticalRestCare(err, req, res, next) {
        console.log('Nurse got the critical RESTful patient - doa :(');
        if (err.inner) delete err.inner.stack;
        if (!err.inner) delete err.inner;
        delete err.stack;
        var unAnseredPrayer = web.minion.angel.prayer(minionName, req.originalUrl, null, null, {code: 418, text: '418 - I\'m a teapot'}, err);
        web.sendJson(res, null, unAnseredPrayer);
    },
    
    criticalSiteCare: function criticalSiteCare(notFoundPath, req, res, next) {
        console.log('Nurse got the critical WebSite patient - doa :(');
        if (req.accepts('html')) {
            // Get this boss directory and Web Site root directory
            res.status(404).sendFile(path.resolve(__dirname, '../bosses/www/pages/notfound.html'));
            return;
        }
        if (req.accepts('json')) {
            console.log('Nurse got a Web Site patient - doa ;( that accepts JSON - responding');
            console.log('Replying RESTfully in JSON');
            var err = new MinionError(boss, minionName, 'Resource not found', 210, null);
            delete err.stack;
            var unAnseredPrayer = web.minion.angel.prayer(minionName, req.originalUrl, null, null, {code: 418, text: '418 - I\'m a teapot'}, err);
            web.sendJson(res, null, unAnseredPrayer);
            return;
        }
        else {
            res.status(404).sendFile(notFoundPath + '/images/pac/cyborg.svg');
        }
    }
};    
    
})();