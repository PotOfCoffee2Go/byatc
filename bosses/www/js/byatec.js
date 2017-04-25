"use strict";

// Assign namespace to hold auction data and functions
var byatec = byatec || {};

(function (ns) {
    /* global io */

    ns.connect = function byatec_connect(url) {

        if (typeof io === 'undefined') {
            throw new Error('Script socket.io.js must be loaded for WebSockets to work');
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.min.js"></script>
        }

        // Connect to server and get our socket
        ns.socket = io.connect(url, {reconnect: false});

        ns.on = function(event, listener) {ns.socket.on(event, listener); };
        ns.off = function(event, listener) { ns.socket.removeListener(event, listener); };
        
        // Implement Catch-all -wildcard(*) feature- for byatec custom messages
        //  only catches byatec custom events (not regular socket.io events)
        //  http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
        // Handy for debugging
        /*
        var onevent = ns.socket.onevent;
        ns.socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call (this, packet);        // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);         // additional call to catch-all
        };

        // Usage of Catch-all byatec custom events
        byatec.on('*', function (event, msg) {
            console.log('***', event, msg);
        });
        */
        
        // Custom socket.io events
        /*
        All byatec custom socket.io emits and on events contain :
        {
            resource: 'the resource (or path) requested',
            data: object {} containing the data to emit(), or on() event is data returned,
            status: 'the status of the message',
            error: {name and message of error } or null if no error
        }
        */
        var payload = function(resource, data) {
            return {
                resource: resource,
                data: data,
                status: null,
                error: null
            };
        };

        // Emit message to the server
        ns.emit = function byatec_emit(message, payload) {
            ns.socket.emit(message, payload);
        };
        
        ns.watch = function byatec_watch(resource) {ns.emit('Watch', payload(resource));};
        ns.unwatch = function byatec_unwatch(resource) {ns.emit('Unwatch', payload(resource));};

    };
})(byatec);