/*
 * /minions/chef.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file handles RESTful 'GET' requests by building the response
 * by quering the byatec auction system databases.
 *
 */

'use strict';

(function() {

    const
        alasql = require('alasql'),
        gearbox = require('./#gearing/gearbox'),

        MinionError = gearbox.MinionError,
        minionName = 'chef';

    // Expressjs web server
    var web = null;

    function Chef(Web) {
        web = Web;
    }

    Chef.prototype.onGetItemsByCategory = function onGetItemsByCategory(req, res, next, prayer) {
        var
            results = {},
            catsheet = web.cfg.spreadsheets.sheets.find(r => r.alias === 'categories'), // guests,items,auction
            itemsheet = web.cfg.spreadsheets.sheets.find(r => r.alias === 'items'); // guests,items,auction
        try {
            var catData = catsheet.db.getData('/');
            var itemData = itemsheet.db.getData('/');
            var catIds = Object.keys(catData);
            catIds.forEach((catid) => {
                //if (catid === 'C006') {
                results[catid] = catData[catid];
                results[catid].items = {};
                var dbresult = alasql('SELECT * FROM ? AS item WHERE [1]->category->id = ?', [itemData, catid]);
                dbresult.forEach((result) => {
                    //delete result['1'].trello; delete result['1'].category;
                    results[catid].items[result['0']] = result['1'];
                });
                //}
            });
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data items by category', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = results;
        web.sendJson(null, res, prayer);
    };


    Chef.prototype.onSelectFromSheetsDb = function onSelectFromSheetsDb(req, res, next, prayer) {
        var
            pathList = prayer.resource.split('/'),
            datastore = web.cfg.spreadsheets.sheets.find(s => s.alias === pathList[3]), // guests,items,categories
            // get field names -  after ('find/select') and do not include last field (value to find)
            dataPath = pathList.slice(5, pathList.length - 1);

        var cmd = pathList[4];
        // convert value to a bool or number
        var value = pathList[pathList.length - 1];
        if (value.toUpperCase() === 'FALSE') value = false;
        else if (value.toUpperCase() === 'TRUE') value = true;
        else if (!isNaN(value)) value = +value;

        prayer.data = {};
        try {
            var records = datastore.db.getData('/');
            Object.keys(records).forEach((recordid) => {
                var found = false;
                var data = records[recordid];
                dataPath.forEach((field) => {
                    if (data[field]) {
                        data = data[field];
                        found = true;
                    }
                    else {
                        found = false;
                    }
                });
                var empty = Object.keys(data).length === 0 && data.constructor === Object;
                if (data === value || (value === '*' && found === true && !empty)) {
                    if (cmd === 'find') prayer.data[recordid] = records[recordid];
                    else {
                        var object = {},
                            o = object;
                        for (var i = 0; i < dataPath.length; i++) {
                            o = o[dataPath[i]] = i === dataPath.length - 1 ? data : {};
                        }
                        prayer.data[recordid] = object;
                    }
                }
            });
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        web.sendJson(null, res, prayer);
    };

    Chef.prototype.onGetFromSheetsDb = function onGetFromSheetsDb(req, res, next, prayer) {
        if (prayer.resource.split('/')[4] === 'find' || prayer.resource.split('/')[4] === 'select') {
            web.minion.chef.onSelectFromSheetsDb(req, res, next, prayer);
            return;
        }
        if (prayer.resource.split('/')[3] === 'items' && prayer.resource.split('/')[4] === 'by' &&
            prayer.resource.split('/')[5] === 'category') {
            web.minion.chef.onGetItemsByCategory(req, res, next, prayer);
            return;
        }
        var recid = prayer.resource.split('/')[4],
            sheetAlias = prayer.resource.split('/')[3],
            sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === sheetAlias);
        try { // Remove the '/boss/clerk/alias' from resource to get the DB path
            var dataPath = prayer.resource.split('/').slice(4).join('/');
            if (recid)
                prayer.data[recid] = sheet.db.getData('/' + dataPath);
            else
                prayer.data = sheet.db.getData('/' + dataPath);
        }
        catch (err) {
            var error = new MinionError(minionName, 'Can not get data from Db', 101, err);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        web.sendJson(null, res, prayer);
    };

    Chef.prototype.onGetAuctionRows = function onGetAuctionRows(req, res, next, prayer) {
        var alias = prayer.resource.split('/')[3] + '/' + prayer.resource.split('/')[4];
        var sheet = web.cfg.spreadsheets.sheets.find(s => s.alias === alias);
        if (sheet === undefined || !sheet.rows) {
            var error = new MinionError(minionName, 'Can not get rows from sheet', 101, null);
            web.sendJson(null, res, web.minion.angel.errorPrayer(error, prayer));
            return;
        }
        prayer.data = sheet.rows;
        web.sendJson(null, res, prayer);
    };



    module.exports = Chef;

})();
