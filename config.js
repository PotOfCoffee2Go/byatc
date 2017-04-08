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

    kingdom: {}, // [Added at runtime] Credentials/Keys to the kingdom

    websockets: true, // Enable socket.io

    trello: { // Enable Trello - change to trelloNotUsed to disable
        me: {
            id: '' // [Added at runtime] Trello member id
        },
        database: 'trello', // Database name prefix results in ('trello' + alias + '.json')
        boards: [
            {
                id: '', // [Added at runtime] Trello board id
                name:'Onyx and Breezy Seating Chart', // Name of board on Trello
                alias: 'guests', // Board name used in Database, REST, and Websocket requests
                
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/trello/guests' Trello webhook callback
                callbackURL:'', // [Added at runtime] Trello webhook
                webhook: [] // [Added at runtime] Trello webhook
            },
            {
                id: '', // [Added at runtime] Trello board id
                name:'Onyx and Breezy Categories', // Name of board on Trello
                alias: 'items', // Board name used in Database, REST, and Websocket requests
                
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/trello/items' Trello webhook callback
                callbackURL:'', // [Added at runtime] Trello webhook
                webhook: [] // [Added at runtime] Trello webhook
            }
        ]
    },
    
    spreadsheets: {
        database: 'sheets', // Database name prefix results in ('sheets' + alias + '.json')
        sheets: [
            {
                id: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs', // id of sheet on google sheets
                name: '2016 O&B Guest List', // Info only - the id is what google uses to open the sheet
                alias: 'guests', // Sheet name used in Database, REST, and Websocket requests
                range: 'Auction_Guest_Entry!A1:K1000', // Range of data to collect
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/sheets/guests' Google webhook callback from sheet menu
                callbackURL:'' // [Added at runtime] Trello webhook
            },
            {
                id: '1PScbPDA3tjMwP1hvXndCZC4Z3nmzT8dunkKRBOKM9Kc', // id of sheet on google sheets
                name: '2016 O&B Item List', // Info only - the id is what google uses to open the sheet
                alias: 'items', // Sheet name used in Database, REST, and Websocket requests
                range: 'Assets!A1:G1000', // Range of data to collect
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/sheets/guests' Google webhook callback from sheet menu
                callbackURL:'' // [Added at runtime] Trello webhook
            }
        ]
    }
};
