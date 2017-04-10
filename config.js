module.exports = {
    cyborg: {
        host:'0.0.0.0', // Computer default routes (0.0.0.0 is config by network)
        port: 8080      // Port on computer to run server
    },
    ninja: {
        host:'0.0.0.0',
        port: 8081
    },
    pirate: {
        host:'0.0.0.0',
        port: 8082     // Port on computer to run server
    },

    kingdom: {}, // [Added at runtime] Credentials/Keys to the kingdom from Her Majesty

    websockets: true, // Enable socket.io

    spreadsheets: {
        database: 'sheets', // Database name prefix results in ('sheets' + alias + '.json')
        sheets: [
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Guest List', // Info only - the id is what google uses to open the sheet
                alias: 'guests', // Name used in Database, REST, and Websocket requests
                range: 'Auction_Guests!A1:K1000', // Range of data to collect from sheet
                db: null, // [Added at runtime] Object returned when db connect/open
                boardName: 'Auction Guests', // Name of board on Trello
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'items', // Name used in Database, REST, and Websocket requests
                range: 'Auction_Items!A1:J1000', // Range of data to collect
                db: null, // [Added at runtime] Object returned when db connect/open
                boardName: 'Auction Items', // Name of board on Trello
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'category', // Name used in Database, REST, and Websocket requests
                range: 'Categories!A1:D100', // Range of data to collect
                db: null, // [Added at runtime] Object returned when db connect/open
                boardName: '', // Name of board on Trello - '' = do not create
            }
        ]
    },

    trello: { 
        database: 'trello', // Database name prefix results in ('trello' + sheet.alias + '.json')
        team: {shortname: 'onyxbreezy'}, // Under what team to create the Trello boards
        boards: [], // [Added at runtime] Trello boards - info on each board
        template: { 
            name: 'Auction Templates',
            board: {} // [Added at runtime] cards used as template for new cards
        },
/*
        boards: [
            {
                id: '', // [Added at runtime] Trello board id
                name:'Auction Guests', // [Added at runtime] Name of board on Trello
                alias: 'guests', // [Added at runtime] Name used in Database, REST, and Websocket requests
                
                db: null, // [Added at runtime] Object returned when db connect/open

                // '/cyborg/webhook/trello/guests' Trello webhook callback
                callbackURL:'', // [Added at runtime] Trello webhook
                webhook: [] // [Added at runtime] Trello webhook
            }
        ]
*/
    },
};
