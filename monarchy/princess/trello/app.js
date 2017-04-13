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
            cards:'open', card_fields:'name,labels',
            card_checklists: 'none',
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
                cb(new Error('Princess Trello unable to get Team from Trello'));
            }
            else {
                var team = entry.response.find(t => t.name === cfg.trello.team.shortname);
                if (team) {
                    cfg.trello.team = {
                        id: team.id,
                        shortname: team.name,
                        displayName: team.displayName};
                    cb(null, 'Princess Trello using team ' + team.displayName);
                }
                else {
                    cb(new Error('Princess Trello - Team not found - ' + cfg.trello.team.shortname));
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
            if (cb) cb(err, 'Princess Trello boards ' + boardnames.join(', '));
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
            if (cb) cb(err, {'Princess Trello using webhooks': webhookUrls});
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
            if (err) {cb(err, board); return;}

            board.id = entry.response.id;
            delete board.action;
            if (cb) cb(err, 'Princess Trello created board ' + board.name);
        });
        api.send();
    }
    else {
        if (cb) cb(null, 'Princess Trello found board ' + board.name);
    }
}


function putWebhook(board, cb) {
    if (board.webhook && board.webhook.action === 'create') {
        api.push('put.webhooks', {
            callbackURL: board.callbackURL,
            idModel: board.id,
            description: board.name
        }, (err, entry) => {
            if (err) {cb(err, board); return;}

            board.webhook = entry.response;
            if (cb) cb(err, 'Princess Trello created webhook for board ' + board.name);
        });
        api.send();
    }
    else {
        if (cb) cb(null, 'Princess Trello found webhook for board ' + board.name);
    }
}
    
function getBoard(board, cb) {
    var idBoard = board.id;
    api.push('get.boards.id',
        telloArguments.getBoard(idBoard),
        (err, entry) => {
            if (err) {cb(err, board); return;}

            board.lists = entry.response.lists;
            entry.response.alias = board.alias;
            board.db.push('/', format.board(entry.response));
            if (cb) cb(err, 'Princess Trello saved data from board ' + board.name);
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
    // Scan and add guest lists that are not on board
    var sheetcards, boardlists;
    var sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    var board = cfg.trello.boards.find(b => b.alias === 'guests');
    try {
        sheetcards = sheet.db.getData('/');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access guest sheet and/or trello board databases');
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

    // Scan and add item lists that are not on board
    sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    board = cfg.trello.boards.find(b => b.alias === 'items');
    try {
        sheetcards = sheet.db.getData('/');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access item sheet and/or trello board databases');
        return;
    }
    
    cards = Object.keys(sheetcards);
    cards.forEach(function(idCard) {
        let category = sheetcards[idCard].category.Name;
        let list = boardlists.find(l => l.name === category);
        if (!list && sheetcards[idCard].category.Name.length > 0) {
            boardlists.push({id: null, name: category});
        }
    });
    board.db.push('/lists', boardlists);

    if (cb) cb(null, 'Princess Trello - board lists are synchronized');
}

function addNewGuestBoardLists(cfg, cb) {
    // Scan and add guest lists that are not on board
    var boardlists;
    var board = cfg.trello.boards.find(b => b.alias === 'guests');
    try {
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access Guest trello board database');
        return;
    }
    
    var listCount = 0;
    boardlists.forEach(function(list) {
        if (!list.id) listCount++;
    });
    
    boardlists.forEach(function(list) {
        if (!list.id) {
            api.push('post.board.lists',
                {idBoard: board.id, name: list.name, pos: 'bottom' },
                (err, entry) => {
                    if (err) {
                        if (cb) cb(err, 'Princess Trello unable to add Guest list');
                    }
                    else {
                        list.id = entry.response.id;
                        listCount--;
                        
                    }
                    if (cb && listCount === 0) {
                        board.db.push('/lists', boardlists);
                        cb(err, 'Princess Trello synchronized Guest Trello board lists');
                    }
                });
            api.send();
        }
    });
    if (cb && listCount === 0) {
        cb(null, 'Princess Trello found no lists to be added to Guest Trello board');
    }

}

function addNewItemBoardLists(cfg, cb) {
    // Scan and add guest lists that are not on board
    var boardlists;
    var board = cfg.trello.boards.find(b => b.alias === 'items');
    try {
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access Item trello board database');
        return;
    }
    
    var listCount = 0;
    boardlists.forEach(function(list) {
        if (!list.id) listCount++;
    });
    
    boardlists.forEach(function(list) {
        if (!list.id) {
            api.push('post.board.lists',
                {idBoard: board.id, name: list.name, pos: 'bottom' },
                (err, entry) => {
                    if (err) {
                        if (cb) cb(err, 'Princess Trello unable to add Item lists');
                    }
                    else {
                        list.id = entry.response.id;
                        listCount--;
                        
                    }
                    if (cb && listCount === 0) {
                        board.db.push('/lists', boardlists);
                        cb(err, 'Princess Trello synchronized Item Trello board lists');
                    }
                });
            api.send();
        }
    });
    if (cb && listCount === 0) {
        cb(null, 'Princess Trello found no lists to be added to Items Trello board');
    }

}

function addNewGuestBoardCards(cfg, cb) {
    // Scan and add guest cards that are not on board
    var sheetcards, boardlists;
    var sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'guests');
    var board = cfg.trello.boards.find(b => b.alias === 'guests');
    try {
        sheetcards = sheet.db.getData('/');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access guest sheet and/or trello board databases');
        return;
    }
    
    var cardCount = 0;
    var cards = Object.keys(sheetcards);
    cards.forEach(function(idCard) {
        if (!sheetcards[idCard].trello) cardCount++;
    });
    
    cards.forEach(function(idCard) {
        if (!sheetcards[idCard].trello) {
            let table = 'Table ' + sheetcards[idCard].sheet.starting_table;
            let idList = boardlists.find(l => l.name === table).id;
            if (idList && sheetcards[idCard].sheet.starting_table.length > 0) {
                api.push('post.cards',
                    {idList: idList,
                    name: sheetcards[idCard].sheet.id + ' - ' + 
                        sheetcards[idCard].sheet.first_name + ' ' + 
                        sheetcards[idCard].sheet.last_name,
                    idCardSource: cfg.trello.template.board.cards[0].id,
                    keepFromSource: 'checklists'},
                    (err, entry) => {
                        if (err) {
                            if (cb) cb(err, 'Princess Trello unable to add Guest cards');
                        }
                        else {
                            // sheetcards[idCard].trello = entry.response;
                            cardCount--;
                            
                        }
                        if (cb && cardCount === 0) {
                            sheet.db.push('/', sheetcards);
                            cb(err, 'Princess Trello synchronized Guest Trello board cards');
                        }
                    });
                api.send();
            }
        }
    });
    if (cb && cardCount === 0) {
        cb(null, 'Princess Trello found no cards to be added to Guest Trello board');
    }
}

function addNewItemBoardCards(cfg, cb) {
    // Scan and add item cards that are not on board
    var sheetcards, boardlists;
    var sheet = cfg.spreadsheets.sheets.find(s => s.alias === 'items');
    var board = cfg.trello.boards.find(b => b.alias === 'items');
    try {
        sheetcards = sheet.db.getData('/');
        boardlists = board.db.getData('/lists');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access item sheet and/or trello board databases');
        return;
    }
    
    var cardCount = 0;
    var cards = Object.keys(sheetcards);
    cards.forEach(function(idCard) {
        if (!sheetcards[idCard].trello) cardCount++;
    });
    
    cards.forEach(function(idCard) {
        if (!sheetcards[idCard].trello) {
            let category = sheetcards[idCard].category.name;
            let idList = boardlists.find(l => l.name === category).id;
            if (idList && sheetcards[idCard].category.name.length > 0) {
                api.push('post.cards',
                    {idList: idList,
                    name: sheetcards[idCard].sheet.id + ' - ' + 
                        sheetcards[idCard].sheet.Donation,
                    idCardSource: cfg.trello.template.board.cards[1].id,
                    keepFromSource: 'checklists'},
                    (err, entry) => {
                        if (err) {
                            if (cb) cb(err, 'Princess Trello unable to add Item cards');
                        }
                        else {
                            // sheetcards[idCard].trello = entry.response;
                            cardCount--;
                            
                        }
                        if (cb && cardCount === 0) {
                            sheet.db.push('/', sheetcards);
                            cb(err, 'Princess Trello synchronized Item Trello board cards');
                        }
                    });
                api.send();
            }
        }
    });
    if (cb && cardCount === 0) {
        cb(null, 'Princess Trello found no cards to be added to Item Trello board');
    }
}


function verifyGuestBoardLabels(cfg, cb) {
    // Scan and add guest lists that are not on board
    var boardlabels;
    var board = cfg.trello.boards.find(b => b.alias === 'guests');
    try {
        boardlabels = board.db.getData('/labels');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access Guest trello board database');
        return;
    }
    
    var labelInfo = {
        green: {name: 'Player', id: null, rename: false},
        yellow: {name: 'Donor', id: null, rename: false},
        orange: {name: 'Bidder', id: null, rename: false},
        red: {name: 'Issues', id: null, rename: false},
        purple: {name: 'Winner!', id: null, rename: false},
        blue: {name: 'Paid', id: null, rename: false},
        sky: {name: 'Delivered', id: null, rename: false},
    }
    boardlabels.forEach(function(label) {
        let info = labelInfo[label.color];
        info.id = label.id;
        if (info.name !== label.name) info.rename = true;
    });
    
    var labelCount = 0;
    boardlabels.forEach(function(label) {
        let info = labelInfo[label.color];
        if (info.id === null || info.rename) labelCount++;
    });

    var labelInfoId = Object.keys(labelInfo);
    labelInfoId.forEach(function(idInfo) {
        let info = labelInfo[idInfo];
        if (!info.id) {
            api.push('post.labels',
                {idBoard: board.id,
                name: info.name,
                color:idInfo},
                (err, entry) => {
                    if (err && cb) cb(err, 'Princess Trello unable to add Guest label');
                    else labelCount--;

                    if (cb && labelCount === 0) cb(err, 'Princess Trello synchronized Guest Trello board');
                });
            api.send();
        }
        if (info.rename) {
            api.push('put.labels',
                {idLabel: info.id,
                name: info.name},
                (err, entry) => {
                    if (err && cb) cb(err, 'Princess Trello unable to rename Guest label');
                    else labelCount--;

                    if (cb && labelCount === 0) cb(err, 'Princess Trello synchronized Guest Trello board labels');
                });
            api.send();
        }
    });
    
    if (cb && labelCount === 0) {
        cb(null, 'Princess Trello found no labels to be changed on Guest Trello board');
    }
}

function verifyItemBoardLabels(cfg, cb) {
    // Scan and add guest lists that are not on board
    var boardlabels;
    var board = cfg.trello.boards.find(b => b.alias === 'items');
    try {
        boardlabels = board.db.getData('/labels');
    } catch(err) {
        if (cb) cb(err, 'Princess Trello unable to access Item trello board database');
        return;
    }
    
    var labelInfo = {
        green: {name: 'Ready', id: null, rename: false},
        yellow: {name: 'Donated', id: null, rename: false},
        orange: {name: 'Bid', id: null, rename: false},
        red: {name: 'Issues', id: null, rename: false},
        purple: {name: 'Won!', id: null, rename: false},
        blue: {name: 'Paid', id: null, rename: false},
        sky: {name: 'Delivered', id: null, rename: false},
    }
    boardlabels.forEach(function(label) {
        let info = labelInfo[label.color];
        info.id = label.id;
        if (info.name !== label.name) info.rename = true;
    });
    
    var labelCount = 0;
    boardlabels.forEach(function(label) {
        let info = labelInfo[label.color];
        if (info.id === null || info.rename) labelCount++;
    });

    var labelInfoId = Object.keys(labelInfo);
    labelInfoId.forEach(function(idInfo) {
        let info = labelInfo[idInfo];
        if (!info.id) {
            api.push('post.labels',
                {idBoard: board.id,
                name: info.name,
                color:idInfo},
                (err, entry) => {
                    if (err && cb) cb(err, 'Princess Trello unable to add Item label');
                    else labelCount--;

                    if (cb && labelCount === 0) cb(err, 'Princess Trello synchronized Item Trello board labels');
                });
            api.send();
        }
        if (info.rename) {
            api.push('put.labels',
                {idLabel: info.id,
                name: info.name},
                (err, entry) => {
                    if (err && cb) cb(err, 'Princess Trello unable to rename Item label');
                    else labelCount--;

                    if (cb && labelCount === 0) cb(err, 'Princess Trello synchronized Item Trello board labels');
                });
            api.send();
        }
    });
    
    if (cb && labelCount === 0) {
        cb(null, 'Princess Trello found no labels to be changed on Item Trello board');
    }
}


exports = module.exports = {
    setCredentials: function setCredentials(creds) { api.setCredentials(creds); },


    getTrelloInfo: function getTrelloInfo(cfg, cb) {
        async.series([
            (callback) => {getMemberTeam(cfg, callback);},
            (callback) => {getMemberBoards(cfg, callback);},
            (callback) => {getWebhooks(cfg, callback);},
        ], (err, results) => {
            if (cb) cb(err, results);
        });
    },


    gearBoard: function(board, cb) {
        async.series([
            (callback) => {postBoard(board, callback);},
            (callback) => {putWebhook(board, callback);},
            (callback) => {getBoard(board, callback);},
            // (callback) => {getBoardComments(board, callback);},
        ], (err, results) => {
            if (cb) cb(err, results);
        });
    },
    
    syncTrelloBoards: function syncTrelloBoards(cfg, cb) {
        async.series([
            (callback) => {getBoardListsFromSheets(cfg, callback);},
            (callback) => {addNewGuestBoardLists(cfg, callback);},
            (callback) => {addNewItemBoardLists(cfg, callback);},
            (callback) => {addNewGuestBoardCards(cfg, callback);},
            (callback) => {addNewItemBoardCards(cfg, callback);},
            (callback) => {verifyGuestBoardLabels(cfg, callback);},
            (callback) => {verifyItemBoardLabels(cfg, callback);},
        ], (err, results) => {
            if (cb) cb(err, results);
        });
    },


};
    
    
})();