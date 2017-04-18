module.exports = {
    kingdom: {}, // [Added at runtime] Credentials/Keys to the kingdom from Her Majesty

    websockets: true, // Enable socket.io

    spreadsheets: {
        database: '', // Database name prefix results in ('sheets' + alias + '.json')
        sheets: [
            // Guests, Items, and Categories - used by frontend web sites
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Guest List', // Info only - the id is what google uses to open the sheet
                alias: 'guests', // Name used in Database, REST, and Websocket requests - must be 'guests'
                range: 'Auction_Guests!A1:K1000', // Sheet and Range of data
                boardName: 'Auction Guests', // Name of board on Trello - create if not already on Trello
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'items', // Name used in Database, REST, and Websocket requests - must be 'items'
                range: 'Auction_Items!A2:E1000', // Sheet and Range of data
                boardName: 'Auction Items',  // Name of board on Trello - create if not already on Trello
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'categories', // Name used in Database, REST, and Websocket requests - must be 'categories'
                range: 'Categories!A2:E100', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
            },
            
            // Guest and Item information - used/updated by ninja as auction runs
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Guest List', // Info only - the id is what google uses to open the sheet
                alias: 'auction/guests', // Name used in Database, REST, and Websocket requests - must be 'auction/guests'
                range: 'Auctioneer!A2:I1000', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
                remove: true,   // Remove database after merging with main Guest DB
                fields: {'id': 0, 'fullname': 1, 'table': 2, 'player?': 3, 'donor?': 4, 'issues?': 5,
                        'bidder?': 6, 'winner?': 7, 'paid?': 8, 'delivered?': 9, 'bids': 10, 'won': 11,
                        'due': 12, 'shipping': 13, 'tax': 14, 'paid': 15}
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'auction/items', // Name used in Database, REST, and Websocket requests - must be 'auction/items'
                range: 'Auction_Items!F2:U1000', // Sheet and Range of data
                boardName: '', // Name of board on Trello - '' = do not create
                remove: true,   // Remove database after merging with main Item DB
                fields: {'id': 0, 'OpenBid': 1, 'Increment': 2, 'BuyPrice': 3, 'BuyOnly?': 4,
                        'Active?': 5, 'QtyLeft': 6, 'QtySold': 7, 'CurrentBid': 8, 'Time': 9,
                        'Bidder': 10, 'Due': 11, 'Shipping': 12, 'Tax': 13, 'Paid': 14 }
            },
        ]
    },

    // Trello Databases - contains members, labels and lists that are on the Trello boards
    //  Rarely needed by Frontend sites - but handy for sophisticated frontends that interface
    //   directly to the Trello boards
    trello: { 
        database: 'trello', // Database name prefix results in ('trello' + sheet.alias + '.json')
        team: {shortname: 'onyxbreezy'}, // Under what team to create the Trello boards
        boards: [], // [Added at runtime] Trello boards - info on each board
        template: { 
            name: 'Auction Templates',
            board: {} // [Added at runtime] cards used as template for new cards
        },
    },
};
