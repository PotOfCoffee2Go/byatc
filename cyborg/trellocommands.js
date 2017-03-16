'use strict';

(function(){

var myBoards = [
    { id: '58c30bd318ee6b1ecbfdbe97', name: 'Onyx and Breezy Categories', idOrganization: '589c6048074f02495a781a73' },
    { id: '58bf31441c021977766ad620', name: 'Onyx and Breezy Seating Chart',idOrganization: '589c6048074f02495a781a73' },
    { id: '58a0cfd9b0f7a760bd734a01', name: 'Onyx and Breezy Distribution Server', idOrganization: '589c6048074f02495a781a73' },
    { id: '589c62ad72cffad8b13dc839', name: 'Onyx and Breezy Auction Development', idOrganization: '589c6048074f02495a781a73' } ];

const
    byatc = require('./byatc'),
    moment = require('moment-timezone');

var format = {
    board: function(board){
        return {
            name: board.name,
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
    card: function(card) {
        
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
function getBoardComments(resultDB, idBoard, cb) {
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
            resultDB.push('/boards/' + idBoard, {comments: comments}, false);
        }
        if (cb) cb(err, entry);
    });
    byatc.send();
}


module.exports = {
    getWebhooks: function(resultDB, cb) {
        byatc.push('get.tokens.token.webhooks', {
            token: process.env.TRELLO_TOKEN
            }, (err, entry) => {
                if (err) {
                    resultDB.push('/webhooks', err);
                }
                else {
                    resultDB.push('/webhooks', entry.response);
                }
                if (cb) cb(err, entry);
            });
        byatc.send();
    },
    
    getBoard:  function(resultDB, cb) {
        byatc.push('get.boards.id', {
            id: myBoards[1].id,
            fields:'name,idOrganization,url',
            members: 'all', labels:'all', cards:'open', card_checklists: 'all',
            member_fields: 'fullName,username,confirmed,memberType',
            card_attachments: true,
            card_attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
            }, (err, entry) => {
                if (err) {
                    resultDB.push('/boards', err);
                }
                else {
                    resultDB.push('/boards/' + entry.response.id, format.board(entry.response));
                    getBoardComments(resultDB, entry.response.id, cb);
                }
            });
        
        byatc.send();
    },
    
    putWebhooks: function(resultDB, callbackURL, cb) {
        byatc.push('put.webhooks', {
            callbackURL: 'byatc-potofcoffee2go.c9users.io' + callbackURL,
            idModel: myBoards[1].id,
            description: myBoards[1].name
        }, (err, entry) => {
            if (err) {
                resultDB.push('/putwebhooks', err);
            }
            else {
                resultDB.push('/putwebhooks', entry.response);
            }
            if (cb) cb(err, entry);
        });
        byatc.send();
    }

};
    
    
})();