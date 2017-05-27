/*
 * /minions/architect.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file creates the objects, files, and structures required by
 * the byatec auction system.
 *
 */

'use strict';

(function() {

    const
        fs = require('fs-extra'),
        async = require('async'),
        request = require('request'),
        JsonDB = require('node-json-db'),
        gearbox = require('./#gearing/gearbox'),

        MinionError = gearbox.MinionError,
        minionName = 'architect';

    // Expressjs web server
    var web = null; // assigned later

    function Architect(Web) {
        web = Web;
    }


    // Intercom communication between bosses
    Architect.prototype.gearIntercom = function gearIntercom(boss, cb) {
        // Todo: Intercom system
        cb(null, ['Boss intercom started']);
    };

    // Get data for auction from google sheets
    Architect.prototype.gearSheets = function gearSheets(boss, cb) {
        // Array of sheets to collect data from
        async.mapSeries(web.cfg.spreadsheets.sheets, function(sheet, callback) {
            // dbname, true = auto save, true = pretty
            sheet.db = new JsonDB(boss.dbdir + '/' + web.cfg.spreadsheets.database + sheet.alias, true, true);

            web.spreadsheets.gearSheet(sheet, callback);

        }, (err, results) => {
            cb(err, results);
        });
    };

    Architect.prototype.loadFromSources = function loadFromSources(boss, cb) {
        if (web.cfg.kingdom.reload) {
            // Start up tasks which this boss is responible
            async.series([
                callback => web.minion.architect.rousePrincessTrello(callback),
                callback => web.minion.architect.gearSheets(boss, callback),
                callback => web.minion.architect.gearTrello(boss, callback),
                callback => web.minion.architect.gearDatabases(callback),
                callback => web.minion.architect.gearTrelloBoards(callback),
            ], (err, results) => cb(err, results));
        }
        else {
            var assigned = [];
            // assign existing databases
            web.cfg.spreadsheets.sheets.forEach((sheet) => {
                sheet.db = new JsonDB(boss.dbdir + '/' + web.cfg.spreadsheets.database + sheet.alias, true, true);
                assigned.push(boss.name + ' assigned database ' + web.cfg.spreadsheets.database + sheet.alias + '.json');
            });

            cb(null, [boss.name + ' restart is using existing database files', assigned]);
        }

    };


    Architect.prototype.rousePrincessTrello = function rousePrincessTrello(cb) {
        web.trello.rousePrincessTrello(web.cfg, (err, results) => cb(err, results));
    };


    // Build the Trello interface
    Architect.prototype.gearTrello = function gearTrello(boss, cb) {
        var whresults = [];
        // Array of boards to collect data from
        async.mapSeries(web.cfg.trello.boards, function(board, callback) {
            // dbname, true = auto save, true = pretty
            board.db = new JsonDB(boss.dbdir + '/' + web.cfg.trello.database + board.alias, true, true);

            // Add the paths that will be used by the Trello WebHooks
            whresults = whresults.concat(web.minion.angel.gearTrelloWebhook(boss, board));

            web.trello.gearBoard(board, callback);

        }, (err, results) => {
            results = whresults.concat(results);
            cb(err, results);
        });
    };


    Architect.prototype.gearTrelloBoards = function gearTrelloBoards(cb) {
        web.trello.gearTrelloBoards(web.cfg, (err, results) => {
            cb(err, results);
        });
    };

    Architect.prototype.gearDatabases = function gearDatabases(cb) {
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


    Architect.prototype.gearChat = function gearChat(boss, cb) {

        async.series([
            callback => web.minion.crier.gearAlasql(callback),
            // Array of rooms to store and retrieve messages
            callback =>
            async.mapSeries(web.cfg.chat.rooms, function(room, callbackmap) {
                // dbname, true = auto save, true = pretty
                room.db = new JsonDB(boss.dbdir + '/' + web.cfg.chat.database + room.alias, true, true);

                web.minion.crier.gearChatRoom(room, callbackmap);

            }, (err, results) => {
                callback(err, results);
            })
        ], (err, results) => cb(err, results));

    };


    module.exports = Architect;

})();
