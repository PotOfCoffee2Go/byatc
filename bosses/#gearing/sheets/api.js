var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

var queenCredentials = null;

// First is in local ~/project/GSheet/client_secret.json
// Second is in ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
myCredentials(clientSecret, token);

function myCredentials(clientSecret, token) {
    queenCredentials = {
        clientSecret: clientSecret,
        token: token
    };
    
    authorize(JSON.parse(queenCredentials.clientSecret), accessWorkbook);

}

function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    var token = 'ya29.GlsYBDwQT-SZ9vY60f-wrTjAK9CZHkfUFkY4jf7uyv-oYrcMgLQgfZZV-57hUUO0E3yg0J96PMlOxWbbY2u8NYUP6fP7fBvwgJ07pYDJpnsqEzLmRvjouMdWovyX","refresh_token":"1/5hXL2FQvUmvCXR9zuL53Rf7lCvA7Z1Site1vRYjBN_4';

    oauth2Client.credentials = JSON.parse(queenCredentials.token);
    callback(oauth2Client);
}

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

