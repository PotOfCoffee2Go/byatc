'use strict';

(function () {
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'nurse';


// Expressjs web server
var web = null;
    
function Nurse (Web) {
    web = Web;
}

Nurse.prototype.criticalSiteCare = function criticalSiteCare(req, res, next) {
        var fullUrl = web.minion.angel.getFullURL(req, res, next);
        console.log('Nurse got the critical WebSite patient -' + fullUrl.pathname + '- doa :(');

        if (req.accepts('html')) {
            // Get this boss directory and Web Site root directory
            res.status(404).sendFile(path.resolve(__dirname, '../bosses/www/pages/notfound.html'));
            return;
        }
        if (req.accepts('json')) {
            console.log('Nurse got a Web Site patient - doa ;( that accepts JSON');
            console.log('Replying RESTfully in JSON');
            var prayer = web.minion.angel.invokePrayer(req, res, next);
            var error = new MinionError(minionName, 'Resource not found', 210, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        else {
            res.status(404).sendFile(__dirname, '../bosses/www/pages/notfound.html');
        }
    }
    
module.exports = Nurse;

})();