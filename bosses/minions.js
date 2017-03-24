'use strict';

(function () {

const
    angel = require('../minions/angel'),
    architect =  require('../minions/architect'),
    chef = require('../minions/chef'),
    clerk = require('../minions/clerk'),
    constable = require('../minions/constable'),
    nurse = require('../minions/nurse');

    function gearMinions(web) {
        angel.gear(web);
        architect.gear(web);
        chef.gear(web);
        clerk.gear(web);
        constable.gear(web);
        nurse.gear(web);
    }

 module.exports =  {
    gearMinions: gearMinions,
    angel: angel,
    architect: architect,
    chef: chef,
    clerk: clerk,
    constable: constable,
    nurse: nurse
};


})();