'use strict';

(function (){

    var util = require("util");

    // From a blatantly copy of node-json-db ./lib/Error.js 
    function NestedError(msg, id, nested) {
        var tmp = Error.apply(this, arguments);
        tmp.name = this.name = 'NestedError';

        this.boss = '';
        this.minion = '';
        this.stack = tmp.stack;
        this.message = tmp.message;
        this.inner = nested;
        this.id = id;
        return this;
    }

    util.inherits(NestedError, Error);

    NestedError.prototype.toString = function () {
        var string = this.name + ": " + this.message;
        if (this.inner) {
            return string + ':\n' + this.inner;
        }
        return string;
    };


    function MinionError(boss, minion, msg, id, nested) {
        var error = NestedError.call(this, msg, id, nested);
        error.name = 'MinionError';
        error.boss = boss;
        error.minion = minion;
        return error;
    }

    util.inherits(MinionError, NestedError);


    module.exports = {
        MinionError: MinionError,
    };
    
})();