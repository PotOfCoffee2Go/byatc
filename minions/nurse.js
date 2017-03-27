'use strict';

(function (){
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'nurse';


// Express web server and boss for this minion
var web = null;
    
function Nurse (bossWeb) {
    web = bossWeb;
}

Nurse.prototype.criticalRestCare = function criticalRestCare(err, req, res, next) {
        console.log('Nurse got the critical RESTful patient - doa :(');
        if (err.inner) delete err.inner.stack;
        if (!err.inner) delete err.inner;
        delete err.stack;

        if (err.prayer) {
            var denied = err.prayer;
            denied.resource = req.originalUrl;
            denied.data = denied.location = null;
            denied.status = {code: 418, text: '418 - I\'m a teapot'};
            delete err.prayer;
            denied.error = err;
            web.sendJson(res, null, denied);
        }
        else {
            web.sendJson(res, null, err);
        }
    }
    
Nurse.prototype.criticalSiteCare = function criticalSiteCare(notFoundPath, req, res, next) {
        console.log('Nurse got the critical WebSite patient - doa :(');
        if (req.accepts('html')) {
            // Get this boss directory and Web Site root directory
            res.status(404).sendFile(path.resolve(__dirname, '../bosses/www/pages/notfound.html'));
            return;
        }
        if (req.accepts('json')) {
            console.log('Nurse got a Web Site patient - doa ;( that accepts JSON - responding');
            console.log('Replying RESTfully in JSON');
            var err = new MinionError(web.boss.name, minionName, 'Resource not found', 210, null);
            delete err.stack;
            var unAnseredPrayer = web.minion.angel.prayer(minionName, req.originalUrl, null, null, {code: 418, text: '418 - I\'m a teapot'}, err);
            web.sendJson(res, null, unAnseredPrayer);
            return;
        }
        else {
            res.status(404).sendFile(notFoundPath + '/images/pac/cyborg.svg');
        }
    }
    
module.exports = Nurse;

})();