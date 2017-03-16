'use strict';

(function(){

const
    util = require('util'),
    byatc = require('../byatc'),
    moment = require('moment-timezone');

    var actions = {
        createCard: function(resultDB, body) {
            byatc.push('get.boards.id.cards.idCard', {
                id: body.model.id,
                idCard: body.action.data.card.id,
                checklists: 'all',
                attachments: true,
                attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
                }, (err, entry) => {
                    if (err) {
                        console.log(err);
                        //resultDB.push('/boards', err);
                    }
                    else {
                        entry.byatc.log += ('adding ' + entry.response.name);
                        resultDB.push('/boards/' + body.model.id + '/cards[]', entry.response);
                    }
                });
            
            byatc.send();
        },
        updateCard: function(resultDB, body) {
            if (body.action.data.card.closed) {
                var cards = resultDB.getData('/boards/' + body.model.id + '/cards');
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].id === body.action.data.card.id) {
                        console.log(body.action.type + ' deleting ' + cards[i].name);
                        resultDB.delete('/boards/' + body.model.id + '/cards[' + i +']');
                        break;
                    }
                }
                return;
            }
            byatc.push('get.boards.id.cards.idCard', {
                id: body.model.id,
                idCard: body.action.data.card.id,
                checklists: 'all',
                attachments: true,
                attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
                }, (err, entry) => {
                    if (err) {
                        console.log(err);
                        //resultDB.push('/boards', err);
                    }
                    else {
                        var cards = resultDB.getData('/boards/' + body.model.id + '/cards');
                        for (let i = 0; i < cards.length; i++) {
                            if (cards[i].id === body.action.data.card.id) {
                                entry.byatc.log += (body.action.type +' updating ' + cards[i].name);
                                resultDB.push('/boards/' + body.model.id + '/cards[' + i +']',
                                    entry.response, true);
                                break;
                            }
                        }
                    }
                });
            byatc.send();
        }



    };

    module.exports = {
        trello: function(resultDB, req, res, cb) {
            // console.log(util.inspect(req.body, { showHidden: true, depth: null }));
            try {
                actions[req.body.action.type](resultDB, req.body);
            }
            catch (e) {
                if (req.body.action.data.card.id) {
                    actions['updateCard'](resultDB, req.body);
                }
            } 
            cb(req, res);
        }
    }
    
    
})();