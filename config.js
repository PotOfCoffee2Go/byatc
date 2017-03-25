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
        database: 'trello.json', // Database filename
        db: null, // [Added at runtime] Object returned when db connect/open
        cyborg : {
            boards: [
                {
                    id: '', // [Added at runtime] Trello board id
                    name:'Onyx and Breezy Seating Chart', // Name of board on Trello
                    alias: 'guests', // Board name used in Database, REST, and Websocket requests
                    db: null, // [Added at runtime] Object returned when db connect/open
                    // '/cyborg/trello/obuser' Trello webhook callback
                    autoCreateWebhook: false, // Auto create this webhook if not on Trello
                    callbackURL:'http://byatc-potofcoffee2go.c9users.io/trellocallback',
                    webhook: [] // [Added at runtime] Trello webhook
                }
            ]
        },
        ninja : {
            boards: [
                {
                    id: '', // [Added at runtime] Trello board id
                    name:'Onyx and Breezy Categories', // Name of board on Trello
                    alias: 'items', // Board name used in Database, REST, and Websocket requests
                    db: null, // [Added at runtime] Object returned when db connect/open
                    // Trello webhook callback
                    autoCreateWebhook: false, // Auto create this webhook if not on Trello
                    callbackURL:'http://byatc-potofcoffee2go.c9users.io/ninja/trello/obcat',
                    webhook: [] // [Added at runtime] Trello webhook
                }
            ]
        },
        templates: {
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
        }
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
