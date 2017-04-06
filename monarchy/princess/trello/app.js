'use strict';

(function(){

const
    byatc = require('./api'),
    async = require('async'),
    moment = require('moment-timezone');

    var telloArguments = {
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
            members: 'all', labels:'all', cards:'open', card_fields:'name,labels', card_checklists: 'all',
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
}

function getMemberBoards(board, cb) {
    byatc.push('get.member.id.boards',
        telloArguments.getMemberBoards(),
        (err, entry) => {
            if (err) {
                board.db.push('/boardlist', err);
            }
            else {
                var boardOnTrello = entry.response.find(x => x.name === board.name);
                if (boardOnTrello === undefined) {
                    if (cb) cb(new Error( 'You are not a member of board "' + 
                        board.name + '" or board does not exist on trello'));
                    return;
                }
                else {
                    board.id = boardOnTrello.id;
                    board.db.push('/boardlist', entry.response);
                }
            }
            if (cb) cb(err, entry);
        });
    byatc.send();
}

function getWebhooks(board, cb) {
    byatc.push('get.tokens.token.webhooks', {
        token: byatc.getToken()
        }, (err, entry) => {
            if (err) board.db.push('/webhooks', err);
            else board.db.push('/webhooks', entry.response);
            if (cb) cb(err, entry);
        });
    byatc.send();
}

function gearTrelloBoardandWebhook(board, cb) {
    var boardList, webHooks;
    try {
        boardList = board.db.getData('/boardlist');
        webHooks = board.db.getData('/webhooks');
    } catch(e) {
        if (cb) cb(new Error( 'Unable to gear Trello board ' + board.name + 
            ' - insure getMemberBoards() and getWebhooks() where successful'));
        return;
    }
    
    var boardOnTrello = boardList.find(b => b.name === board.name);
        if (boardOnTrello === undefined) {
            if (cb) cb(new Error( 'You are not a member of board "' + 
                board.name + '" or board does not exist on trello'));
            return;
        }
        
    var webhookTrello = webHooks.find(b => b.idModel === board.id && b.callbackURL === board.callbackURL);
        if (webhookTrello === undefined) {
            putWebhooks(board, cb);
            return;
        }
    
    if (cb) cb(null);
}



function putWebhooks(board, cb) {
    byatc.push('put.webhooks', {
        callbackURL: board.callbackURL,
        idModel: board.id,
        description: board.name
        }, (err, entry) => {
            if (err) {
                board.db.push('/putwebhooks', err);
            }
            else {
                board.db.push('/putwebhooks', entry.response);
                board.webhook = entry.response;
            }
            if (cb) cb(err, entry);
        });
    byatc.send();
    }
    
function getBoard(board, cb) {
    /*
    var board = board.getData('/boardlist').find(x => x.name === boardName);
    if (board === undefined) {
        cb(new Error(boardName + ' does not exist for this members key/token'));
        return;
    }
    */
    var idBoard = board.id;
    byatc.push('get.boards.id',
        telloArguments.getBoard(idBoard),
        (err, entry) => {
            if (err) {
                board.db.push('/', err);
            }
            else {
                entry.response.alias = board.alias;
                board.db.push('/', format.board(entry.response));
            }
            if (cb) cb(err, entry);
        });
    byatc.send();
}

function getBoardComments(board, cb) {
    var idBoard = board.id;
    byatc.push('get.boards.id.actions', {
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
    byatc.send();
}

exports = module.exports = {
    setCredentials: function(creds) { byatc.setCredentials(creds); },
    
    gearTrelloBoard: function(board, cb) {
        async.series([
            function(callback) {getMemberBoards(board, (err) => {callback(err);})},
            function(callback) {getWebhooks(board, (err) => {callback(err);})},
            function(callback) {gearTrelloBoardandWebhook(board, (err) => {callback(err);})},
            function(callback) {getBoard(board, (err) => {callback(err);})},
            function(callback) {getBoardComments(board, (err) => {callback(err);})},
        ],
        function(error) {
            if (cb) cb(error);
        });
    }
};
    
    
})();