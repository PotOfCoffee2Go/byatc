'use strict';

(function(){

const
    util = require('util'),
    api = require('./api'),
    moment = require('moment-timezone');

    var telloArguments= {
        createCard: function(body) {
            return {
                id: body.model.id,
                idCard: body.action.data.card.id,
                checklists: 'all',
                attachments: true,
                attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
            };
        },
        updateCard: function(body) {
            return {
                id: body.model.id,
                idCard: body.action.data.card.id,
                checklists: 'all',
                attachments: true,
                attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url'
            };
        }
        
    };


    var actions = {
        createCard: function(custCards, body) {
            api.push('get.boards.id.cards.idCard',
                telloArguments.createCard(body),
                (err, entry) => {
                    if (err) {
                        console.log(err);
                        //custCards.push('/boards', err);
                    }
                    else {
                        entry.api.log += ('adding ' + entry.response.name);
                        custCards.push('/boards/' + body.action.data.board.name + '/cards[]', entry.response);
                    }
                });
            
            api.send();
        },
        updateCard: function(custCards, body) {
            if (body.action.data.card.closed) {
                var cards = custCards.getData('/boards/' + body.action.data.board.name + '/cards');
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].id === body.action.data.card.id) {
                        console.log(body.action.type + ' deleting ' + cards[i].name);
                        custCards.delete('/boards/' + body.action.data.board.name + '/cards[' + i +']');
                        break;
                    }
                }
                return;
            }
            api.push('get.boards.id.cards.idCard',
                telloArguments.updateCard(body),
                (err, entry) => {
                    if (err) {
                        console.log(err);
                        //custCards.push('/boards', err);
                    }
                    else {
                        var cards = custCards.getData('/boards/' + body.action.data.board.name + '/cards');
                        for (let i = 0; i < cards.length; i++) {
                            if (cards[i].id === body.action.data.card.id) {
                                entry.api.log += (body.action.type +' updating ' + cards[i].name);
                                custCards.push('/boards/' + body.action.data.board.name + '/cards[' + i +']',
                                    entry.response, true);
                                break;
                            }
                        }
                    }
                });
            api.send();
        }



    };

    exports = module.exports = {
        trello: function(custCards, req, res, cb) {
            // console.log(util.inspect(req.body, { showHidden: true, depth: null }));
            try {
                actions[req.body.action.type](custCards, req.body);
            }
            catch (e) {
                if (req.body.action.data.card.id) {
                    actions['updateCard'](custCards, req.body);
                }
            } 
            cb(req, res);
        }
    }
    
    
})();