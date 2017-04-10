'use strict';

(function(){

const
    api = require('./api'),
    async = require('async'),
    moment = require('moment-timezone');

    var telloArguments = {
        getMemberOrganizations: function() {
            return {
                id:'me',
            };
        },
        getMemberBoards: function() {
            return {
                id:'me',
                filter: 'open',
                fields: 'name'
            };
        },
        getBoard: function(idBoard) {
            return {
            id: idBoard,
            fields:'name,idOrganization,url',
            members: 'all', labels:'all',
            cards:'open', card_fields:'name,labels', card_checklists: 'all',
            lists: 'open', list_fields: 'name',
            member_fields: 'fullName,username,confirmed,memberType',
            card_attachments: true,
            card_attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
            };
        }
    };

var format = {
    board: function(board){
        return {
            id: board.id,
            name: board.name,
            alias: board.alias,
            url: board.url,
            at: moment().format(),
            //at: moment.tz('America/New_York').format(),
            // request: request,
            idOrganization: board.idOrganization,
            members: board.members,
            labels: board.labels,
            lists:board.lists,
            cards: board.cards
        };
    },

    comment: function(comment) {
        return {
            id: comment.id,
            text: comment.data.text,
            date: comment.date,
            idMemberCreator: comment.idMemberCreator,
            card: {id: comment.data.card.id, name:comment.data.card.name}
        };
    },
};

function getMemberTeam(cfg, cb) {
    api.push('get.member.organizations',
        telloArguments.getMemberOrganizations(),
        (err, entry) => {
            if (err) {
                cb(new Error({trelloTeam: 'Unable to get Teams from Trello'}));
            }
            else {
                var team = entry.response.find(t => t.name === cfg.trello.team.shortname);
                if (team) {
                    cfg.trello.team = {
                        id: team.id,
                        shortname: team.name,
                        displayName: team.displayName};
                    cb(null, {trelloTeam: team.displayName});
                }
                else {
                    cb(new Error({trelloTeam: 'Team not found - ' + cfg.trello.team.shortname}));
                }
            }
        });
    api.send();
}

function getMemberBoards(cfg, cb) {
    var boards = [], keepers = [], boardnames = [];
    api.push('get.member.id.boards',
        telloArguments.getMemberBoards(),
        (err, entry) => {
            if (err) {
                boards = [];
            }
            else {
                boards = entry.response;
            }
            
            getTemplateBoard(cfg, boards);
            
            cfg.spreadsheets.sheets.forEach(function (sheet) {
                let board = boards.find(b => sheet.boardName === b.name);
                if (board) {
                    board.alias = sheet.alias;
                    keepers.push(board);
                    boardnames.push(board.name);
                }
                else {
                    if (sheet.boardName && sheet.boardName.length > 0) { // Only boards with a name
                        keepers.push({name: sheet.boardName, alias: sheet.alias, idTeam: cfg.trello.team.id, action: 'create'});
                        boardnames.push(sheet.boardName);
                    }
                }
            });
            cfg.trello.boards = keepers;
            if (cb) cb(err, {trelloBoards: boardnames});
        });
    api.send();
}

function getWebhooks(cfg, cb) {
    var webhooks = [], keepers = [], webhookUrls = [];
    api.push('get.tokens.token.webhooks', {
        token: api.getToken()
        }, (err, entry) => {
            if (err) {
                webhooks = [];
            }
            else {
                webhooks = entry.response;
            }
            cfg.trello.boards.forEach(function (board) {
                let webhook = webhooks.find(f => f.idModel === board.id);
                if (webhook) {
                    board.webhook = webhook;
                    webhookUrls.push({boardname: board.name, callbackURL: webhook.callbackURL});
                 }
                else {
                    board.webhook = {idModel: board.id, action: 'create'};
                    webhookUrls.push({boardname: board.name, callbackURL: 'No Trello Callback'});
                }
            });
            if (cb) cb(err, {webhooks: webhookUrls});
        });
    api.send();
}


function postBoard(board, cb) {
    if (board.action && board.action === 'create') {
        api.push('post.board', {
            name: board.name,
            idOrganization: board.idTeam,
            defaultLists: false,
            prefs_permissionLevel: 'org'
        }, (err, entry) => {
            if (!err) {
                board.id = entry.response.id;
                delete board.action;
            }
            if (cb) cb(err, board);
        });
        api.send();
    }
    else {
        if (cb) cb(null, board);
    }
}


function putWebhook(board, cb) {
    if (board.webhook && board.webhook.action === 'create') {
        api.push('put.webhooks', {
            callbackURL: board.callbackURL,
            idModel: board.id,
            description: board.name
            }, (err, entry) => {
                if (!err) {
                    board.webhook = entry.response;
                }
                if (cb) cb(err, entry);
        });
        api.send();
    }
    else {
        if (cb) cb(null, board.webhook);
    }
}
    
function getBoard(board, cb) {
    var idBoard = board.id;
    api.push('get.boards.id',
        telloArguments.getBoard(idBoard),
        (err, entry) => {
            if (err) {
                board.db.push('/', err);
            }
            else {
                board.lists = entry.response.lists;
                entry.response.alias = board.alias;
                board.db.push('/', format.board(entry.response));
            }
            if (cb) cb(err, entry);
        });
    api.send();
}

function getBoardComments(board, cb) {
    var idBoard = board.id;
    api.push('get.boards.id.actions', {
        id: idBoard,
        filter: 'commentCard'
    }, (err, entry) => {
        if (err) {
            console.log(err);
        }
        else {
            let comments = [];
            entry.response.forEach((comment) => {
                comments.push(format.comment(comment));
            });
            // false = merge into existing board
            board.db.push('/comments', comments);
        }
        if (cb) cb(err, entry);
    });
    api.send();
}

function getTemplateBoard(cfg, boards) {
    boards.forEach(function(board) {
        if (board.name === cfg.trello.template.name) {
            api.push('get.boards.id', {
                id: board.id,
                fields:'name,idOrganization,url',
                members: 'none', labels:'none',
                cards:'open', card_fields:'name', card_checklists: 'none' },
                (err, entry) => {
                    if (err) {
                        //board.db.push('/', err);
                    }
                    else {
                        cfg.trello.template.board = entry.response;
                    }
                });
            api.send();
        }
    });
}

function getBoardListsFromSheets(cfg, cb) {
    var sheetcards, boardlists;
    var sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    var board = cfg.trello.boards.find(b => b.alias === 'guests');
    try {
        sheetcards = sheet.db.getData('/cards');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Unable to access guest sheet and/or trello board');
        return;
    }
    
    var cards = Object.keys(sheetcards);
    cards.forEach(function(idCard) {
    let table = 'Table ' + sheetcards[idCard].sheet.starting_table;
        let list = boardlists.find(l => l.name === table);
        if (!list && sheetcards[idCard].sheet.starting_table.length > 0) {
            boardlists.push({id: null, name: table});
        }
    });
    board.db.push('/lists', boardlists);
    if (cb) cb(null, 'Trello board lists are synchronized');

 /*   
    sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    board = cfg.trello.boards.find(b => b.alias === 'items');
    try {
        sheetcards = sheet.db.getData('/cards');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Unable to access item sheet and/or trello board');
        return;
    }
    
    var cards = Object.keys(sheetcards);
    cards.forEach(function(idCard) {
    let table = 'Table ' + sheetcards[idCard].sheet.starting_table;
        let list = boardlists.find(l => l.name === table);
        if (!list && sheetcards[idCard].sheet.starting_table.length > 0) {
            boardlists.push({id: null, name: table});
        }
    });
    board.db.push('/lists', boardlists);
*/
}

exports = module.exports = {
    setCredentials: function setCredentials(creds) { api.setCredentials(creds); },


    getTrelloInfo: function getTrelloInfo(cfg, cb) {
        async.series([
            function(callback) {getMemberTeam(cfg, callback);},
            function(callback) {getMemberBoards(cfg, callback);},
            function(callback) {getWebhooks(cfg, callback);},
        ],
        function(err, results) {
            if (cb) cb(err, results);
        });
    },


    gearBoard: function(board, cb) {
        async.series([
            function(callback) {postBoard(board, callback);},
            function(callback) {putWebhook(board, callback);},
            function(callback) {getBoard(board, callback);},
            // function(callback) {getBoardComments(board, callback);},
        ],
        function(err) {
            if (err)
                cb(err, 'Error ' + board.name + ' unable to create DB trello' + board.alias + '.json');
            else
                cb(err, 'Loaded ' + board.name + ' into DB trello' + board.alias + '.json');
        });
    },
    
    syncTrelloBoards: function syncTrelloBoards(cfg, cb) {
        async.series([
            function(callback) {getBoardListsFromSheets(cfg, callback);},
        ],
        function(err, results) {
            if (cb) cb(err, results);
        });
    },


};
    
    
})();