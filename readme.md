## byatc

**B**est **Y**ielding **A**uction **T**ool **C**reated

-----

Three servers - one that access Trello boards for customer and item administration and management. An auction server to handle accepting and distribution of item pricing, bids, and winnings. A payment server for customers to pay for won items.

-----


### The Minions acknowledge there are three bosses!

<img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/cyborg.png" height="48" width="48" /><img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/ninja.png" height="48" width="48" /><img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/pirate.png" height="48" width="48" />

( Actually the bosses are full blown Nodejs express Web Site/REST/Websocket servers - but don't tell the minions! :) The servers are the main entry point for processing requests from web frontends.<br /><br />
**Boss \#1** is the Auction Administration Server which uses Trello boards to setup, create, monitor, and manage auction customers and items.<br /><br />
**Boss \#2** the Auction Server, processes provides customer authentication, item information, bid, buy-now, and bidder-to-bidder messaging.<br /><br />
While **Boss \#3** the Checkout Server provides middleware between customer and Credit Card Processors for the payment of auction items won.

Each server has a RESTFul interface, but IMHO the socket.io Websocket interface is the way to go. The resource name and resulting data payload response is the same for either REST or Websocket requests. For the Websocket interface, a JSON object is returned that mimics the content that is normally in the Header of a REST request (status code, content-type, etc). The advantage of a Websocket is that web frontends can 'Watch' resource names. When a resource data changes the server will send (emit) the update via the Websocket. This is especially important for Web Frontends connected to the Ninja Auction Server; since they can Watch auction items and will notified of bid price changes. (Thus eliminating the 'polling' that would be required when using the REST interface.)

There is a browser side API `<script src="https://server/you/are/using/api.js" type="text/javascript" />` which handles the lower level stuff allowing you to implement `auction.on(event){}` functions to process data sent by the servers.

-------

#### 'Cyborg' - Auction Administration

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/cyborg.png" height="80" width="80" align="left">
 <p>On startup - requests all interesting data from cards and comments for boards on Trello. The minions use the data to create a JSON database representing the cards and comments on the boards. If not already created, board level webhooks are created on Trello. Trello sends update events of user interaction with the Trello boards via the webhooks. Using the board and card ids given by the webhooks, Cyborg commands the minions to request all interesting info for that card from Trello. The Minions update the JSON database with the response from Trello.</p>

#### 'Ninja' - Runs the Auction
 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/ninja.png" height="80" width="80" align="left">
 <p>Auction specific Frontends, web sites, and/or web pages connect via Websockets (for dynamic updates of auction item bid price updates). Bids can be placed via the RESTful or the WebSocket (socket.io) interface. Various item setup options available such as open, reserve, and incremental price.</p>

#### 'Pirate' - Payment Checkout

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/pirate.png" height="80" width="80" align="left">
 <p>Interfaces to Paypal/Credit Card Processors, Banks, etc. for payment of won auction items. Produces invoices, receipts, statements, and financials for non-profit or for-profit organizations.</p>
<br />

-------

### The Minions

![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/angel48.png)
![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/nurse48.png)
![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/architect48.png)
![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/chef48.png)
![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/clerk48.png)
![](https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/constable48.png)

-------
Similar to bosses - the Minions 'think' they exist in a physical universe; but sadly they are just Nodejs Modules. Again - *mum's the word* - they might get wise and allow themselves to be forked, cloned, and zipped to work for other open-source teams! ;( undoubtably resulting in a ton of GitHub issues - Minions have their own agenda and are not known to be all that developer friendly ).

Each Minion represents a high level task required of their boss. For example, the *Cyborg* boss *architect* <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/architect48.png" height="16" width="16" align="bottom"/> minion may be totally different code from the *Pirate* boss *architect* <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/architect48.png" height="16" width="16" align="bottom"/> minion. So each minion performs the basic tasks required, but are custom coded for the boss they represent.

-------

### The basic functions needed by all three bosses are:
<br />
<img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/angel48.png" height="48" width="48" align="left">
 <p><b>angel</b> - Data requests: make a request and pray it gets done.</p><br />

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/nurse48.png" height="48" width="48" align="left">
 <p><b>nurse</b> - Data health: insures data validation, integrity, and consistancy.</p><br />

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/architect48.png" height="48" width="48" align="left">
 <p><b>architect</b> - Data creation and destruction: creates, initializes, and deletes data objects and elements.</p><br />

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/chef48.png" height="48" width="48" align="left">
 <p><b>chef</b> - Data reporting: performs data query and calculation; processing raw data to useful information.</p><br />

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/clerk48.png" height="48" width="48" align="left">
 <p><b>clerk</b> - Data distribution: organizes distribution of synchronous/asynchronous processing of data.</p><br />

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/constable48.png" height="48" width="48" align="left">
 <p><b>constable</b> - Data security: controls and ensures data access rights are enforced.</p><br />

-------

A thumbs-up to [Pixabay: Free Images](https://pixabay.com/) for providing [CC0 1.0 Universal Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) images - donate if you can!

