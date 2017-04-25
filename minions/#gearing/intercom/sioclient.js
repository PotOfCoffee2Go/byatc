'use strict'

(function () {
    const api = require('./sioapi');

   // api.connect('https://wp-websockets-potofcoffee2go.c9users.io');
    api.connect('https://obauction-potofcoffee2go.rhcloud.com');

    // Catch-all api custom websocket events
    //  (will not see regular socket.io connect/disconnect/etc events)
    //  Handy for displaying stuff during debug
    api.on('*',function(event, msg) {
        console.log('***', event, '***', msg);
    });

    // Standard socket.io events
    //  socket.io connect
    api.on('connect', function() {
        console.log('Established WebSocket connection to auction server');
    });
    //  socket.io disconnect
    api.on('disconnect', function() {
        console.log('WebSocket disconnected from auction server');
    });

    // Custom socket.io events
    /*
    All custom socket.io events contain :
    {
        resource: 'the resource (or path) requested',
        data: object {} containing the data requested,
        location: 'the resource (or path) actually retrieved',
        error: {name and message of error } or null if no error
    }
    */

    //  Connection accepted - so send a buncha requests
    api.on('Connected', function(msg) {
        console.log('Connected to auction server');
    });

    // Got a response to a api.get() request
    // I use the 'location' but could use 'resource' instead - (identical unless redirected)
    //  However: 'location' is null if there was an error
    api.on('Get', function(msg) {
        console.log(msg);
    });

    // Got a response to a api.put() request
    api.on('Put', function(msg) {
        console.log(msg);
    });
    
    // Got a response to a api.post() request
    api.on('Post', function(msg) {
        console.log(msg);
    });
    
    $( "#about" ).click(function() {
        // console.log( "Handler for about .click() called." );
        var codeUrl = 'https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/auction/a117';
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    var responseJson = JSON.parse(xmlhttp.responseText);
                    $('#post1 img').attr('src', responseJson.auction.a117.meta.wdm_auction_thumb);
                    $('#post1 h3').html(responseJson.auction.a117.post.post_title);
                    $('#post1 p:first').html(responseJson.auction.a117.post.post_content);
                }
                else {
                    throw new Error('markupcode: get source file returned status ' + xmlhttp.status);
                }
            }
        };
        xmlhttp.open('GET', codeUrl, true);
        xmlhttp.send();

    });
    
    $( "#services" ).click(function() {
        console.log( "Handler for services .click() called." );
    });
    
    $( "#contact" ).click(function() {
        console.log( "Handler for contact .click() called." );
    });
    
    $( "#call-to-action" ).click(function() {
        console.log( "Handler for call-to-action .click() called." );
    });

    api.auctionClick = function auctionClick(item) {
        alert(item + ' Auction Page');
    }
    
    api.moreInfoClick = function moreInfoClick(item) {
        alert(item+ ' More Info Page');
    }

    console.log( "ready!" );
    
})();
