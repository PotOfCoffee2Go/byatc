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
    var guestList, itemList;

    function Clerk(Web) {
        web = Web;
    }


    function comparator(a, b) {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
    }

    // myArray = myArray.sort(Comparator);

    function objectToArray(columns, obj) {
        var arr = [];
        columns.forEach((col) => {
            arr.push(obj[col]);
        });
        return arr;
    }

    function buildSheetUpdate(sheetData) {
        var ids = Object.keys(sheetData);

    }

    Clerk.prototype.setGuestList = function setGuestList(list) {
        guestList = list;
    };
    Clerk.prototype.setItemList = function setItemList(list) {
        itemList = list;
    };

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

    Clerk.prototype.buildSheetValues = function buildSheetValues(alias, objName) {
        var gsheetArr = [];
        var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias); // guests,items,categories

        var records = sheet.db.getData('/');
        Object.keys(records).forEach((recordid) => {
            gsheetArr.push(objectToArray(sheet.auctionColumns, records[recordid][objName]));
        });
        gsheetArr = gsheetArr.sort(comparator);

        gsheetArr.unshift(sheet.auctionColumns);
        return gsheetArr;
    };
    


    Clerk.prototype.onPostToGoogleSheet = function onPostToGoogleSheet(req, res, next, prayer) {
        
        var updateResults = {checkout: {}, auction: {}};
        async.series([
            callback => {
                var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/checkout');
                var values = web.minion.clerk.buildSheetValues('guests', 'checkout');
                web.spreadsheets.updateSheet(sheet, values, (err, response) => {
                    updateResults.checkout = response;
                    callback(err, response);
                });
            },
            callback => {
                var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/items');
                var values = web.minion.clerk.buildSheetValues('items', 'auction');
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
        var error, ge, ie;
        var guestsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/checkout');
        var itemsheet = web.cfg.spreadsheets.sheets.find(s => s.alias === 'auction/items');

        try {
            ge = guestsheet.fields; // <-- NO LONGER VALID
            ie = itemsheet.fields; // <-- NO LONGER VALID
            var guest = guestsheet.find(g => g[0] === req.body.guestid);
            var item = itemsheet.find(i => i[0] === req.body.itemid);

            if (!item[ie.Ready]) {
                error = new MinionError(minionName, 'This item is not open for bidding', 101, null);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
                return;
            }

            if (item[ie.BuyNowOnly]) {
                error = new MinionError(minionName, 'This item is buy only', 101, null);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
                return;
            }

            if (item[ie.QtyLeft] < 1) {
                error = new MinionError(minionName, 'This item has already been sold', 101, null);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
                return;
            }

            if (req.body.amount >= (item[ie.CurrentBid] + item[ie.Increment])) {
                item[ie.CurrentBid] = req.body.amount;
                item[ie.Bidder] = req.body.guestid;
                guest[ge.bids]++;
                web.sendJson(null, res, prayer);
                return;
            }
            else {
                error = new MinionError(minionName, 'Invalid bid amount - must be current bid + increment (or higher)', 101, null);
                web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
                return;
            }
        }
        catch (err) {
            error = new MinionError(minionName, 'Can not get data from Db', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
    };


    Clerk.prototype.gearDatabases = function gearDatabases(cb) {
        async.series([
            callback => gearbox.merge.trelloIntoGuestDatabase(web, minionName, callback),
            callback => gearbox.merge.trelloIntoItemDatabase(web, minionName, callback),
            callback => gearbox.merge.categoriesIntoItemDatabase(web, minionName, callback),
            callback => gearbox.merge.trelloIntoCategoriesDatabase(web, minionName, callback),
            callback => gearbox.merge.auctionIntoGuestDatabase(web, minionName, callback),
            callback => gearbox.merge.auctionIntoItemDatabase(web, minionName, callback),
            callback => gearbox.merge.removeDatabases(web, minionName, callback),
        ], (err, results) => cb(err, results));
    };


    module.exports = Clerk;

})();
