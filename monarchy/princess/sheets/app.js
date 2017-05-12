/*
 * /monarchy/princess/sheets/app.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file accesses Google Sheets spreadsheets using the 
 * parameters from /config.js. The data from the sheets are
 * used to build the databases and create/update Trello
 * boards of the byatec auction system.
 *
 */

'use strict';

var google = require('googleapis'),
    googleAuth = require('google-auth-library');

var auth = null;

function setCredentials(sheetKeys) {

    var credentials = JSON.parse(sheetKeys.clientSecret);

    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var gauth = new googleAuth();
    var oauth2Client = new gauth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = JSON.parse(sheetKeys.token);
    auth = oauth2Client;
}

function getNextRecord(sheet, records) {
    var recIdKeys = Object.keys(records);

    var recIds = recIdKeys.sort();

    for (var i = 0; i < recIds.length; i++)
        if (records[recIds[i]].profile[sheet.placeholder].length === 0) {
            var lastId = recIds[i];
            break;
        }

    // Get the starting range without the row number
    var startrange = sheet.range.split(':')[0].replace(/\d+$/, '');
    var endrange = sheet.range.split(':')[1].replace(/\d+$/, '');

    // Get the row which is original range plus number of records
    var row = parseInt(sheet.range.split(':')[0].match(/\d+$/), 10) + i + 1;


    return {
        range: startrange + row + ':' + endrange + row,
        id: lastId
    };
}


function csvToObjects(sheet, lines) {
    var records = {},
        columns = lines[0];

    sheet.auctionColumns = lines[0];

    // Get the starting row which is the header row containing field names
    var row = parseInt(sheet.range.split(':')[0].match(/\d+$/), 10);

    // Get the starting range without the row number
    var startrange = sheet.range.split(':')[0].replace(/\d+$/, '');
    var endrange = sheet.range.split(':')[1].replace(/\d+$/, '');

    // loop through each line of csv file
    for (let l = 1; l < lines.length; l++) {
        let data = {};
        // builds object based on column headers
        if (lines[l].length > 0) {
            data.profile = {
                range: startrange + (l + row) + ':' + endrange + (l + row)
            };
            for (let c = 0; c < lines[l].length; c++) {
                var value = lines[l][c];
                data.profile[columns[c]] = value;
            }
            // add object to output
            records[data.profile.id] = data;
        }
    }

    sheet.nextRecord = getNextRecord(sheet, records);
    return records;
}


function gearSheet(sheet, cb) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: sheet.id,
        range: sheet.range,
        valueRenderOption: 'UNFORMATTED_VALUE',
    }, (err, response) => {
        if (err)
            cb(err, 'Princess Sheets error ' + sheet.name + ' unable to create DB ' + sheet.alias + '.json');
        else {
            sheet.rows = response.values;
            sheet.db.push('/', csvToObjects(sheet, response.values));
            cb(err, 'Princess Sheets loaded spreadsheet -' + sheet.name + '- range -' + sheet.range + '- into DB ' + sheet.alias + '.json');
        }
    });
}

function updateSheet(sheet, values, cb) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheet.id,
        range: sheet.range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            range: sheet.range,
            majorDimension: 'ROWS',
            values: values
        },
    }, (err, response) => {
        cb(err, response);
    });
}

function updateRow(sheet, range, values, cb) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheet.id,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            range: range,
            majorDimension: 'ROWS',
            values: values
        },
    }, (err, response) => {
        cb(err, response);
    });
}


module.exports = {
    setCredentials: setCredentials,
    gearSheet: gearSheet,
    updateSheet: updateSheet,
    updateRow: updateRow,
    getNextRecord: getNextRecord
};
