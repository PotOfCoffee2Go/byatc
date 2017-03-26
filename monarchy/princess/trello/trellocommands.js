'use strict';

(function(){

const
    byatc = require('./api'),
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
            members: 'all', labels:'all', cards:'open', card_checklists: 'all',
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

module.exports = {
    setCredentials: function(creds) { byatc.setCredentials(creds); },
    
    getMemberBoards:  function(board, cb) {
        byatc.push('get.member.id.boards',
            telloArguments.getMemberBoards(),
            (err, entry) => {
                if (err) {
                    board.db.push('/boardlist', err);
                }
                else {
                    var boardOnTrello = entry.response.find(x => x.name === board.name);
                    if (boardOnTrello === undefined) {
                        cb(new Error( 'You are not a member of board "' + 
                            board.name + '" or board does not exist on trello'));
                    }
                    else {
                        board.id = boardOnTrello.id;
                        board.db.push('/boardlist', entry.response);
                    }
                }
                if (cb) cb(err, entry);
            });
        byatc.send();
    },
    
    getWebhooks: function(board, cb) {
        byatc.push('get.tokens.token.webhooks', {
            token: byatc.getToken()
            }, (err, entry) => {
                if (err) {
                    board.db.push('/webhooks', err);
                }
                else {
                    var webhookOnTrello = entry.response.find(x =>
                        x.idModel === board.id && x.callbackURL === board.callbackURL);
                    if (webhookOnTrello === undefined) {
                        var noWebhookErr = new Error( 'You do not have a trello webhook for board "' + 
                            board.name + '" with a callbackURL of: ' + board.callbackURL);
                        console.log(noWebhookErr);
                        if (cb) {
                            cb(noWebhookErr);
                        }
                        return;
                    }
                    board.webhook = webhookOnTrello;
                    board.db.push('/webhooks', entry.response);
                }
                if (cb) cb(err, entry);
            });
        byatc.send();
    },
    
    putWebhooks: function(board, cb) {
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
                }
                if (cb) cb(err, entry);
            });
        byatc.send();
        },
        
    getBoard: function(board, cb) {
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
                    board.db.push('/boards/' + board.alias, err);
                }
                else {
                    entry.response.alias = board.alias;
                    board.db.push('/boards/' + board.alias, format.board(entry.response));
                }
                if (cb) cb(err, entry);
            });
        byatc.send();
    },
    
    getBoardComments: function(board, cb) {
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
                board.db.push('/boards/' + board.alias + '/comments', {comments: comments});
            }
            if (cb) cb(err, entry);
        });
        byatc.send();
    }
};
    
    
})();