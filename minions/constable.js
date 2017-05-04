/*
 * /minions/constable.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file handles credentials, roles, and user authorization to
 * byatec auction system resources.
 *
 */

'use strict';

(function() {

    const
        alasql = require('alasql'),
        uuidV4 = require('uuid/v4'),
        gearbox = require('./#gearing/gearbox'),

        MinionError = gearbox.MinionError,
        minionName = 'constable';

    // Expressjs web server
    var web = null,
        keys = [];


    function Constable(Web) {
        web = Web;
    }


    Constable.prototype.setQueensCredentials = function setQueensCredentials(creds) {};

    Constable.prototype.givePrincessSheetsCredentials = function givePrincessSheetsCredentials() {
        web.spreadsheets.setCredentials(web.cfg.kingdom.keys.sheets);
    };

    Constable.prototype.givePrincessTrelloCredentials = function givePrincessTrelloCredentials() {
        web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
        web.trello.setCredentials(web.cfg.kingdom.keys.trello);
    };

    Constable.prototype.checkCredentials = function checkCredentials(boss, cb) {
        if (!web.cfg.kingdom.keys || !web.cfg.kingdom.keys.trello ||
            !web.cfg.kingdom.keys.trello.key.length > 5 || !web.cfg.kingdom.keys.trello.token.length > 5) {
            cb(new Error('Trello Key/Token not in Kingdom Keys'));
        }
        else {
            cb(null, 'Constable verified boss ' + boss.name + ' credentials');
        }
    };

    Constable.prototype.onPostGuestLogin = function onPostGuestLogin(req, res, next, prayer) {
        var guestsheet = web.cfg.spreadsheets.sheets.find(r => r.alias === 'guests'); // guests,items,auction
        try {
            var guestData = guestsheet.db.getData('/');
            var dbresult = alasql('SELECT * FROM ? AS guest WHERE [1]->profile->UserName = ? and ' +
                '[1]->profile->Password = ?', [guestData, req.body.username, req.body.password]);
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get guest login data', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        if (dbresult.length) {
            prayer.data = dbresult[0]['1'].profile;
            prayer.status.guest = prayer.data.id;
            var guestkey = web.minion.constable.verifyGuestKey(prayer);
            if (guestkey) {
                prayer.status.key = guestkey.key;
                web.sendJson(null, res, prayer);
                return;
            }
        }

        if (dbresult.length) {
            prayer.status.key = uuidV4();
            keys.push({
                key: prayer.status.key,
                guest: prayer.data.id
            });
            web.sendJson(null, res, prayer);
        }
        else {
            error = new MinionError(minionName, 'Can not validate guest login', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        }
    };

    Constable.prototype.verifyGuestKey = function verifyGuestKey(prayer) {
        var key = null,
            guest = null;
        if (typeof prayer === 'string') {
            key = prayer.split(' ')[1];
        }
        else {
            key = prayer.status.key;
            guest = prayer.status.guest;
        }
        var guestkey = alasql('SELECT * FROM ? AS keys WHERE key = ? OR guest = ?', [keys, key, guest]);
        return guestkey.length ? guestkey[0] : null;
    };


    module.exports = Constable;


})();
