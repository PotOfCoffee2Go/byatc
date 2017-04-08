'use strict';

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

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

function csvToObjects(lines) {
    var records = {};
    var columns = lines[0];
    // loop through each line of csv file
    for (let l = 1; l <= lines.length-1; l++) {
        let data = {};
        // builds object based on column headers
        if (lines[l].length > 2) {
            for (let c = 0; c < lines[l].length; c++) {
                data[columns[c]] = lines[l][c];          
            }
            data.summary = {bid: 0, won: 0, shipping: 0, tax: 0, paid: 0};
            // add object to output
            records[data.id] = data;
        }
    }
    return records;
}

function gearSheet(sheet, cb) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: sheet.id,
        range: sheet.range,
        valueRenderOption: 'FORMATTED_VALUE',
        },
        function(err, response) {
            if (err) cb(err);
            else {
                let guestList = csvToObjects(response.values);
                sheet.db.push('/cards', guestList);
                cb(err, guestList);
            }
    });
}

module.exports = {
    setCredentials:setCredentials,
    gearSheet: gearSheet
};


/*
function accessWorkbook(auth) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs',
        range: 'Experiment!A8',
        //    valueInputOption: enum(RAW),
        valueInputOption: 'USER_ENTERED',
        resource: {
            range: 'Experiment!A8',
            majorDimension: 'ROWS',
            values: [['=\'2016 O&B Item List\'!C17']]}
        }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
}
*/