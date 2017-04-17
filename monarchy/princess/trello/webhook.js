'use strict';

(function(){

const
    api = require('./api'),
    request = require('request');

function addLabel(cfg, json, cb ) {
    var options = {
        method: 'POST',
        uri: cfg.kingdom.websites.cyborg + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/labels/' + json.data.color,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = removeLabel or addLabel
    };
    request(options, (err, response, body) => {cb(err);});
}

function removeLabel(cfg, json, cb ) {
    var options = {
        method: 'DELETE',
        uri: cfg.kingdom.websites.cyborg + '/cyborg/clerk/' +
            (json.id[0] === 'G' ? 'guests/' : 'items/') +
            json.id + '/trello/labels/' + json.data.color,
        headers: {'User-Agent': 'trello webhook'},
        json: json // action = removeLabel or addLabel
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
            default: cb();

        }
        // console.log(util.inspect(req.body, { showHidden: true, depth: null }));
    }
};
    
    
})();