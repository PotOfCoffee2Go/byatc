/*
 * /minions/clerk.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file handles RESTful 'POST/PUT' requests by updating the 
 * byatec auction system databases.
 *
 */

'use strict';

(function() {

    const
        fs = require('fs-extra'),
        path = require('path'),
        async = require('async'),
        gearbox = require('./#gearing/gearbox'),

        MinionError = gearbox.MinionError,
        minionName = 'clerk';


    // Expressjs web server
    var web = null;

    function Clerk(Web) {
        web = Web;
    }

    Clerk.prototype.onPostToSheetsDb = function onPostToSheetsDb(req, res, next, prayer) {
        var
            data = null,
            newData = req.body.data,
            pathList = prayer.resource.split('/'),
            datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === pathList[3]), // guests,items,categories
            dataPath = '/' + pathList.slice(4, pathList.length - 1).join('/');
        try {
            data = datastore.db.getData(dataPath);
            data[pathList[pathList.length - 1]] = newData;
            datastore.db.push(dataPath, data);
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = newData;
        web.sendJson(null, res, prayer);

        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('POST ' + resource));
    };

    Clerk.prototype.onPostToGoogleSheet = function onPostToGoogleSheet(req, res, next, prayer) {
        var updateResults = {checkout: {}, auction: {}};
        async.series([
            callback => {
                var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/checkout');
                var values = gearbox.values.buildSheetValues(web, 'guests', 'checkout');
                web.spreadsheets.updateSheet(sheet, values, (err, response) => {
                    updateResults.checkout = response;
                    callback(err, response);
                });
            },
            callback => {
                var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/items');
                var values = gearbox.values.buildSheetValues(web, 'items', 'auction');
                web.spreadsheets.updateSheet(sheet, values, (err, response) => {
                    updateResults.auction = response;
                    callback(err, response);
                });
            },
        ], (err, results) => {
            if (err) {
                var error = new MinionError(minionName, results, 101, err);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            }
            else {
                prayer.data = updateResults;
                web.sendJson(null, res, prayer);
            }
        });
    };


    Clerk.prototype.onDeleteFromSheetsDb = function onDeleteFromSheetsDb(req, res, next, prayer) {
        var
            data = null,
            pathList = prayer.resource.split('/'),
            datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === pathList[3]), // guests,items,categories
            dataPath = '/' + pathList.slice(4, pathList.length - 1).join('/');
        try {
            data = datastore.db.getData(dataPath);
            delete data[pathList[pathList.length - 1]];
            datastore.db.push(dataPath, data);
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = data;
        web.sendJson(null, res, prayer);

        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('DELETE ' + resource));
    };

    Clerk.prototype.onBid = function onBid(req, res, next, prayer) {
        var guest, item, error,
            guestsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests'),
            itemsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items'),
            bid = req.body;

        try {
            guest = guestsheet.db.getData('/' + bid.guest);
            item = itemsheet.db.getData('/' + bid.item);
        }
        catch (err) {
            error = new MinionError(minionName, 'Can not get data from Db for bid', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        if (!guest.checkout.Player) {
            error = new MinionError(minionName, 'Guest is not an auction player', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        if (!item.auction.Active) {
            error = new MinionError(minionName, 'Item is currently suspended from auction', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        if (bid.amount < item.auction.NextBid) {
            error = new MinionError(minionName, 'Bid amount must be equal or greater than current bid', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        
        guest.checkout.Bids++;

        item.auction.NextBid = bid.amount + item.auction.Increment;
        item.auction.BidDue = bid.amount;
        item.auction.LastBidder = bid.guest;
        item.auction.Time = new Date();
        item.auction.Bids++;
        
        try {
            guestsheet.db.push('/' + bid.guest, guest);
            itemsheet.db.push('/' + bid.item, item);
        }
        catch (err) {
            error = new MinionError(minionName, 'Can not save data to Db for bid', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        
        prayer.data = {bid: bid, checkout: guest.checkout, auction: item.auction};
        web.sendJson(null, res, prayer);
/*
        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('POST ' + resource));
*/

    };

    Clerk.prototype.onBuy = function onBuy(req, res, next, prayer) {
        var guest, item, error,
            guestsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'guests'),
            itemsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'items'),
            bid = req.body;

        try {
            guest = guestsheet.db.getData('/' + bid.guest);
            item = itemsheet.db.getData('/' + bid.item);
        }
        catch (err) {
            error = new MinionError(minionName, 'Can not get data from Db for bid', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        if (!guest.checkout.Player) {
            error = new MinionError(minionName, 'Guest is not an auction player', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        if (!item.auction.Active) {
            error = new MinionError(minionName, 'Item is currently suspended from auction', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        if (bid.amount < item.auction.NextBid) {
            error = new MinionError(minionName, 'Bid amount must be equal or greater than current bid', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        
        guest.checkout.Bids++;

        item.auction.NextBid = bid.amount + item.auction.Increment;
        item.auction.BidDue = bid.amount;
        item.auction.LastBidder = bid.guest;
        item.auction.Time = new Date();
        item.auction.Bids++;
        
        try {
            guestsheet.db.push('/' + bid.guest, guest);
            itemsheet.db.push('/' + bid.item, item);
        }
        catch (err) {
            error = new MinionError(minionName, 'Can not save data to Db for bid', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }

        
        prayer.data = {bid: bid, checkout: guest.checkout, auction: item.auction};
        web.sendJson(null, res, prayer);
/*
        // Let server send the response before sending to the watchers
        var resource = prayer.resource;
        process.nextTick(() => web.minion.crier.broadcast('POST ' + resource));
*/

    };


    module.exports = Clerk;

})();
