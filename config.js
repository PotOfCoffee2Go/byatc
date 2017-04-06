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
        database: 'trello', // Database filename
        boards: [
            {
                name:'Onyx and Breezy Seating Chart', // Name of board on Trello
                alias: 'guests', // Board name used in Database, REST, and Websocket requests
                
                id: '', // [Added at runtime] Trello board id
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/trello/guests' Trello webhook callback
                callbackURL:'', // [Added at runtime] Trello webhook
                webhook: [] // [Added at runtime] Trello webhook
            },
            {
                name:'Onyx and Breezy Categories', // Name of board on Trello
                alias: 'items', // Board name used in Database, REST, and Websocket requests
                
                id: '', // [Added at runtime] Trello board id
                db: null, // [Added at runtime] Object returned when db connect/open
                // '/cyborg/webhook/trello/items' Trello webhook callback
                callbackURL:'', // [Added at runtime] Trello webhook
                webhook: [] // [Added at runtime] Trello webhook
            }
        ]
    },
    
    google: { // Enable google
        cyborg: {
            sheets: { // Enable sheets
                spreadsheetId: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs',

            }
        },
        ninja: {
            sheets: {
                spreadsheetId: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs',
            }
        },
        pirate: {
            sheets: {
                spreadsheetId: '1GOb0ug8CUppms8K7K4ZkFfdkOV4eX71esKTSYa-6SXs',
            }
        },
        id: '[Added at runtime]',
        name:'Onyx and Breezy Auction Templates',
        customer: {
            cardName: 'Customer Template',
            idCard: '[Added at runtime]'
        },
        item: {
            cardName: 'Item Template',
            idCard: '[Added at runtime]'
        }
    },
};
