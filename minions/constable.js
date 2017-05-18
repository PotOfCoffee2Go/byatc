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

    Constable.prototype.checkCredentials = function checkCredentials(boss, cb) {
        if (!web.cfg.kingdom.keys || !web.cfg.kingdom.keys.trello ||
            !web.cfg.kingdom.keys.trello.key.length > 5 || !web.cfg.kingdom.keys.trello.token.length > 5) {
            cb(new Error('Trello Key/Token not in Kingdom Keys'));
        }
        else {
            cb(null, 'Constable verified boss ' + boss.name + ' credentials');
        }
    };

    Constable.prototype.givePrincessSheetsCredentials = function givePrincessSheetsCredentials(boss, cb) {
        web.spreadsheets.setCredentials(web.cfg.kingdom.keys.sheets);
        cb(null, 'Princess Sheets credentials set');
    };

    Constable.prototype.givePrincessTrelloCredentials = function givePrincessTrelloCredentials(boss, cb) {
        web.webhook.setCredentials(web.cfg.kingdom.keys.trello);
        web.trello.setCredentials(web.cfg.kingdom.keys.trello);
        cb(null, 'Princess Trello credentials set');
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
                prayer.status.token = guestkey.token;
                web.sendJson(null, res, prayer);
                return;
            }
        }

        if (dbresult.length) {
            prayer.status.token = uuidV4();
            keys.push({
                token: prayer.status.token,
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
        var token = null,
            guest = null;
        if (typeof prayer === 'string') {
            token = prayer.split(' ')[1];
        }
        else {
            token = prayer.status.token;
            guest = prayer.status.guest;
        }
        var guestkey = alasql('SELECT * FROM ? AS keys WHERE token = ? OR guest = ?', [keys, token, guest]);
        return guestkey.length ? guestkey[0] : null;
    };


    Constable.prototype.isGuestAuthorized = function isGuestAuthorized(req, res, next, prayer) {
        if (!web.cfg.authenticate) return true;

        if (!prayer.status.guest) {
            var error = new MinionError(minionName, 'Request not authorized.', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
        }
        return prayer.status.guest ? true : false;
    };

    Constable.prototype.onPostGuestRegistration = function onPostGuestRegistration(req, res, next, prayer) {
        var guestsheet = web.cfg.spreadsheets.sheets.find(r => r.alias === 'guests'); // guests,items,auction
        var checkoutsheet = web.cfg.spreadsheets.sheets.find(r => r.alias === 'auction/checkout'); // guests,items,auction
        try {
            var guestData = guestsheet.db.getData('/');
            var checkoutData = checkoutsheet.db.getData('/');
            var dbresult = alasql('SELECT * FROM ? AS guest WHERE [1]->profile->UserName = ? and ' +
                '[1]->profile->Password = ?', [guestData, req.body.username, req.body.password]);
        }
        catch (err) {
            dbresult = [];
        }

        if (dbresult.length) {
            var error = new MinionError(minionName, 'Username and password already in use.', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        var profile = {
            range: guestsheet.nextRecord.range,
            id: guestsheet.nextRecord.id,
            Paying: guestsheet.nextRecord.id,
            Table: 1,
            UserName: req.body.username,
            Password: req.body.password,
            Email: req.body.email,
            FirstName: req.body.surname.split(' ')[0],
            LastName: req.body.surname.split(' ')[1],
            Address: [
                req.body.street,
                req.body.street2,
                req.body.city, req.body.state, req.body.zip
            ].join(';').replace(/;;/g,';'),
            Phone: req.body.tel,
            RSVP: false
        };
        
        // Send to worksheet
        web.spreadsheets.updateRowValues(guestsheet, profile, (err, response) => {
            if (err) {
                error = new MinionError(minionName, 'Unable to update' + guestsheet.alias + 'sheet.', 101, err);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            }
            else {
                guestsheet.db.push('/' + profile.id + '/profile', profile, false); // false = merge
                guestsheet.nextRecord = web.spreadsheets.getNextRecord(guestsheet, guestsheet.db.getData('/'));

                prayer.data = {};
                prayer.data[profile.id] = {
                    profile: profile
                };

                web.sendJson(null, res, prayer);
            }
        });

    };

    Constable.prototype.onGetConfig = function onGetConfig(req, res, next, prayer) {
        
    };

    module.exports = Constable;


})();
