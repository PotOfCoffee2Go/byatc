'use strict';

(function (){
const
    path = require('path'),
    gearbox = require('./#gearing/gearbox'),
    
    MinionError = gearbox.MinionError,
    minionName = 'nurse';


// Express web server and boss for this minion
var web = null;
    
function Nurse (Web) {
    web = Web;
}

Nurse.prototype.criticalSiteCare = function criticalSiteCare(req, res, next, notFoundPath) {
        console.log('Nurse got the critical WebSite patient - doa :(');
        var fullUrl = web.minion.angel.getNodejsURL(req, res, next);
        console.log(fullUrl.pathname);
        
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
            res.status(404).sendFile(notFoundPath + '/images/pac/cyborg.svg');
        }
    }
    
module.exports = Nurse;

})();