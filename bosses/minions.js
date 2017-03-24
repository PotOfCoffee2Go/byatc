'use strict';

(function () {

const
    angel = require('../minions/angel'),
    architect =  require('../minions/architect'),
    chef = require('../minions/chef'),
    clerk = require('../minions/clerk'),
    constable = require('../minions/constable'),
    nurse = require('../minions/nurse');

    function web(web) {
        angel.web(web);
        architect.web(web);
        chef.web(web);
        clerk.web(web);
        constable.web(web);
        nurse.web(web);
    }

 module.exports =  {
    web: web,
    angel: angel,
    architect: architect,
    chef: chef,
    clerk: clerk,
    constable: constable,
    nurse: nurse
};


})();