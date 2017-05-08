/*
 * /config.js
 * Author: Kim McKinley (PotOfCoffee2Go) <kim@lrunit.net>
 * License: MIT
 *
 * This file along with /monarchy/queen.js provides the configuration
 * parameters to the byatec auction system
 *
 */

'use strict';

module.exports = {
    kingdom: {}, // [Added at runtime] Credentials/Keys to the kingdom from Her Majesty

    websockets: true, // Enable socket.io

    //  Google Spreadsheet Databases - contains guests, items and categories
    spreadsheets: {
        database: '', // Database name prefix results in ('sheets' + alias + '.json')
        sheets: [
            // Guests, Items, and Categories - used by frontend web sites
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'guests', // Name used in Database, REST, and Websocket requests - must be 'guests'
                range: 'Guests!A2:I1000', // Sheet and Range of data
                boardName: 'Auction Guests', // Name of board on Trello - create if not already on Trello
            }, {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'items', // Name used in Database, REST, and Websocket requests - must be 'items'
                range: 'Items!A2:E1000', // Sheet and Range of data
                boardName: 'Auction Items', // Name of board on Trello - create if not already on Trello
            }, {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'categories', // Name used in Database, REST, and Websocket requests - must be 'categories'
                range: 'Categories!A2:E100', // Sheet and Range of data
                boardName: 'Auction Categories', // Name of board on Trello
            }, {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'purchases', // Name used in Database, REST, and Websocket requests - must be 'purchases'
                range: 'Purchases!A2:H1000', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
            },

            // Guest and Item information - used/updated by ninja as auction runs
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'auction/checkout', // Name used in Database, REST, and Websocket requests - must be 'auction/guests'
                range: 'Checkout!A2:K1000', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
                remove: true, // Remove database after merging with main Guest DB
                fields: {  // fields in sheet Auctioneer!A2:K1000
                    'id': 0,
                    'Name': 1,
                    'Table': 2,
                    'Bids': 3,
                    'Wins': 4,
                    'Buys': 5,
                    'Won': 6,
                    'Bought': 7,
                    'Shipping': 8,
                    'Tax': 9,
                    'Paid': 10
                }
            }, {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Auction', // Info only - the id is what google uses to open the sheet
                alias: 'auction/items', // Name used in Database, REST, and Websocket requests - must be 'auction/items'
                range: 'Items!F2:S1000', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
                remove: true, // Remove database after merging with main Item DB
                fields: { // fields in sheet Auction_Items!F2:S1000
                    'id': 0,
                    'Active': 1,
                    'OpenBid': 2,
                    'Increment': 3,
                    'BidQtyLeft': 4,
                    'BuyPrice': 5,
                    'BuyOnly': 6,
                    'BuyQtyLeft': 7,
                    'CurrentBid': 8,
                    'BidQtySold': 9,
                    'BuyQtySold': 10,
                    'Bidder': 11,
                    'Time': 12,
                    'Bids': 13
                }
            }
        ]
    },

    // Trello Databases - contains members, labels and lists that are on the Trello boards
    //  Rarely needed by Frontend sites - but handy for sophisticated frontends that interface
    //   directly to the Trello boards
    trello: {
        database: 'trello', // Database name prefix results in ('trello' + board.alias + '.json')
        team: {
            shortname: 'onyxbreezy'
        }, // Under what team to create the Trello boards
        boards: [], // [Added at runtime] Trello boards - info on each board
        template: {
            name: 'Auction Templates',
            board: {} // [Added at runtime] cards as templates for creating cards
        },
    },


    // Contains the chat rooms for guests, items, and auction bids
    chat: {
        database: 'chat', // Database name prefix results in ('chat' + room.alias + '.json')
        rooms: [{
            alias: 'guests'
        }, {
            alias: 'items'
        }, {
            alias: 'auction'
        }, ]
    }
};
