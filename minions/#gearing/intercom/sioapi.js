'use strict'
    
const ioc = require('socket.io-client');

(function () {

module.exports = function (url) {

    // Connect to server, get our socket,
    //   hijack it's event emitter to implement Catch-all custom events
    var csocket = ioc.connect(url, {reconnect: true});

    // Implement Catch-all -wildcard(*) feature- for custom messages
    //  only catches custom events (not regular socket.io events)
    //  http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
    var onevent = csocket.onevent;
    csocket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call (this, packet);        // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);         // additional call to catch-all
    };
    /* Usage of Catch-all custom events
    on(socket, '*', function(event, msg) {
        console.log('***', event, msg);
    });
    */

    // Functions to add / remove our own events
    function on(socket, event, listener) {socket.on(event, listener); }
    function off(socket, event, listener) { socket.removeListener(event, listener); }
    
    
    /// Custom socket.io events
    /*
    All custom socket.io emits and on events contain :
    {
        resource: 'the resource (or path) requested',
        data: object {} containing the data to emit(), or on() event is data returned,
        location: 'the resource (or path) actually retrieved',
        error: {name and message of error } or null if no error
    }
    */
    var prayer = function(resource, data) {
        return {
            resource: resource,
            data: data ? data : {},
            location: null,
            error: null };
    };

    // Emit message to the server
    function emit(socket, message, prayer) {
        socket.emit(message, prayer);
    }
    

    function get(socket, resource) {emit('Get', prayer(socket, resource));}
    function post(socket, resource, data) {emit('Post', prayer(socket, resource, data));}
    function put(socket, resource, data) {emit('Put', prayer(socket, resource, data));}
    function patch(socket, resource, data) {emit('Patch', prayer(socket, resource, data));}
    function del(socket, resource) {emit('Delete', prayer(socket, resource));}
    function watch(socket, resource) {emit('Watch', prayer(socket, resource));}
    function unwatch(socket, resource) {emit('Unwatch', prayer(socket, resource));}

    var module = {
        on: on,
        off: off,
        get: get,
        post: post,
        put: put,
        patch: patch,
        delete: del,
        watch: watch,
        unwatch: unwatch
    };
    
    return module;

};

})();
