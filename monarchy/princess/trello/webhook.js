'use strict';

(function(){

const
    api = require('./api'),
    request = require('request');

function addLabel(cfg, json, cb ) {
    var options = {
        method: 'POST',
        uri: cfg.kingdom.website + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/labels/' + json.data.color,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = addLabel
    };
    request(options, (err, response, body) => {cb(err);});
}

function removeLabel(cfg, json, cb ) {
    var options = {
        method: 'DELETE',
        uri: cfg.kingdom.website + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/labels/' + json.data.color,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = removeLabel
    };
    request(options, (err, response, body) => {cb(err);});
}

function addAttachment(cfg, json, cb ) {
    var options = {
        method: 'POST',
        uri: cfg.kingdom.website + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/attachments/' + json.data.name,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = addAttachment
    };
    request(options, (err, response, body) => {cb(err);});
}

function removeAttachment(cfg, json, cb ) {
    var options = {
        method: 'DELETE',
        uri: cfg.kingdom.website + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/attachments/' + json.data.name,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = removeAttachment
    };
    request(options, (err, response, body) => {cb(err);});
}



exports = module.exports = {
    setCredentials: (creds) => {api.setCredentials(creds);},
    trello: (req, res, next, cfg, cb) => {
        if (!req.body || !req.body.action || 
            !req.body.action || !req.body.action.data) {
            cb();
            return;
        }

        let id, data = req.body.action.data;
        switch (req.body.action.type) {
            case 'removeLabelFromCard':
                id = data.card.name.split(' ')[0];
                data.label.idBoard = data.board.id;
                removeLabel(cfg, {id: id, action: 'removeLabel', data: data.label}, cb);
                break;
            case 'addLabelToCard':
                id = req.body.action.data.card.name.split(' ')[0];
                data.label.idBoard = data.board.id;
                addLabel(cfg, {id: id, action: 'addLabel', data: data.label}, cb);
                break;
            case 'addAttachmentToCard':
                id = req.body.action.data.card.name.split(' ')[0];
                var info = {
                    name: data.attachment.name,
                    url: data.attachment.url
                };
                addAttachment(cfg, {id: id, action: 'addAttachment', data: info}, cb);
                break;
            case 'deleteAttachmentFromCard':
                id = req.body.action.data.card.name.split(' ')[0];
                removeAttachment(cfg, {id: id, action: 'removeAttachment', data: data.attachment}, cb);
                break;
            default: console.log(req.body.action.type); cb(); break;
        }
        // console.log(util.inspect(req.body, { showHidden: true, depth: null }));
    }
};
    
    
})();