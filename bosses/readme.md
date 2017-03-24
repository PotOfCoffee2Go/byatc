## byatc

**B**est **Y**ielding **A**uction **T**ool **C**reated

-----

Three servers - one that access Trello boards for customer and item administration and management. An auction server to handle accepting and distribution of item pricing, bids, and winnings. A payment server for customers to pay for won items.

-----


### The Minions acknowledge there are three bosses!

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="48" width="48" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="48" width="48" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="48" width="48" />

Bosses are full blown Nodejs express Web Site/REST/Websocket servers. The servers are the main entry point for processing requests from web frontends.<br /><br />

The Auction Administration Server which uses Trello boards to setup, create, monitor, and manage auction customers and items.<br /><br />

The Auction Server, processes provides customer authentication, item information, bid, buy-now, and bidder-to-bidder messaging.<br /><br />

The Checkout Server provides middleware between customer and Credit Card Processors for the payment of auction items won.

Each server has a RESTFul interface, but IMHO the socket.io Websocket interface is the way to go. The resource name and resulting data payload response is the same for either REST or Websocket requests. For the Websocket interface, a JSON object is returned that mimics the content that is normally in the Header of a REST request (status code, content-type, etc). The advantage of a Websocket is that web frontends can 'Watch' resource names. When a resource data changes the server will send (emit) the update via the Websocket. This is especially important for Web Frontends connected to the Ninja Auction Server; since they can Watch auction items and will notified of bid price changes. (Thus eliminating the 'polling' that would be required when using the REST interface.)

There is a browser side API `<script src="https://server/you/are/using/api.js" type="text/javascript" />` which handles the lower level stuff allowing you to implement `auction.on(event){}` functions to process data sent by the servers.

-------

#### 'Cyborg' - Auction Administration

 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="80" width="80" align="left">
 <p>On startup - requests all interesting data from cards and comments for boards on Trello. The minions use the data to create a JSON database representing the cards and comments on the boards. If not already created, board level webhooks are created on Trello. Trello sends update events of user interaction with the Trello boards via the webhooks. Using the board and card ids given by the webhooks, Cyborg commands the minions to request all interesting info for that card from Trello. The Minions update the JSON database with the response from Trello.</p>

#### 'Ninja' - Runs the Auction
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="80" width="80" align="left">
 <p>Auction specific Frontends, web sites, and/or web pages connect via Websockets (for dynamic updates of auction item bid price updates). Bids can be placed via the RESTful or the WebSocket (socket.io) interface. Various item setup options available such as open, reserve, and incremental price.</p>

#### 'Pirate' - Payment Checkout

 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="80" width="80" align="left">
 <p>Interfaces to Paypal/Credit Card Processors, Banks, etc. for payment of won auction items. Produces invoices, receipts, statements, and financials for non-profit or for-profit organizations.</p>
<br />
