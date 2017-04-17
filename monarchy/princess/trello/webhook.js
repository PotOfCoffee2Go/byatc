'use strict';

(function(){

const
    api = require('./api'),
    request = require('request');

var telloArguments= {
    createCard: (body) => {
        return {
            id: body.model.id,
            idCard: body.action.data.card.id,
            fields:'name,idOrganization,url',
            cards:'open', fields:'name,labels', checklists: 'all',
            member_fields: 'fullName,username,confirmed,memberType',
            attachments: true,
            attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url',
            checkItemStates: false
                /*
                id: body.model.id,
                idCard: body.action.data.card.id,
                checklists: 'all',
                attachments: true,
                attachment_fields: 'bytes,date,edgeColor,idMember,isUpload,mimeType,name,url' */
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
                    entry.byatc.log += ('adding ' + entry.response.name);
                    custCards.push('/cards[]', entry.response);
                }
            });
        
        api.send();
    },
    updateCard: (body) => {
        api.push('get.boards.id.cards.idCard',
            telloArguments.updateCard(body),
            (err, entry) => {
                if (err) {console.log(err);}
                else {
                    console.log(entry);
                }
            });
        api.send();
    }
};
function updateGuestLabel(cfg, guest, action, color, cb ) {
    var options = {
        method: 'POST',
        uri: cfg.kingdom.websites.cyborg + '/cyborg/clerk/guests/' + guest,
        headers: {'User-Agent': 'trello webhook'},
        json: {guest: guest, action: action, color: color} // action = removeLabel or addLabel
    };
    request(options, (err, response, body) => {cb(err);});
}

function updateItemLabel(cfg, item, action, color, cb ) {
    var options = {
        method: 'POST',
        uri: cfg.kingdom.websites.cyborg + '/cyborg/clerk/items/' + item,
        headers: {'User-Agent': 'trello webhook'},
        json: {item: item, action: action, color: color} // action = removeLabel or addLabel
    };
    request(options, (err, response, body) => {cb(err);});
}



exports = module.exports = {
    setCredentials: (creds) => {api.setCredentials(creds);},
    trello: (req, res, next, cfg, cb) => {
        if (!req.body || !req.body.action || !req.body.action) {
            cb(req, res);
            return;
        }
        
        let id;
        switch (req.body.action.type) {
            case 'removeLabelFromCard':
                 id = req.body.action.data.card.name.split(' ')[0];
                if (id[0] === 'I') {
                    updateItemLabel(cfg, id, 'removeLabel', req.body.action.data.label.color, cb );
                }
                else if (id[0] === 'G') {
                    updateGuestLabel(cfg, id, 'removeLabel', req.body.action.data.label.color, cb );
                }
                break;
            case 'addLabelToCard':
                id = req.body.action.data.card.name.split(' ')[0];
                if (id[0] === 'I') {
                    updateItemLabel(cfg, id, 'addLabel', req.body.action.data.label.color, cb );
                }
                else if (id[0] === 'G') {
                    updateGuestLabel(cfg, id, 'addLabel', req.body.action.data.label.color, cb );
                }
                break;
            default: cb();

        }
        // console.log(util.inspect(req.body, { showHidden: true, depth: null }));
    }
};
    
    
})();