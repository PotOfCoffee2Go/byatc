## byatc

**B**est **Y**ielding **A**uction **T**ool **C**reated

-----

Three servers - one administers and manages guest and item information. 
An auction server to handle accepting and distribution of item pricing, bids, and winnings. 
A payment server for guests to pay for won items.

There is a browser side API which handles the lower level stuff allowing frontends to easily implement
functions to process requests and responses by the servers.

The servers are full blown Nodejs express Web Site/REST/Websocket servers using the expressjs framework. Each server has a 
RESTFul interface, but IMHO the socket.io Websocket interface is the way to go. 
The resource name (url path) and resulting data payload response is the same for either REST or Websocket requests.

For the Websocket interface, a JSON object is returned that mimics the content that is normally in the Header of a 
REST request (status code, content-type, etc). The advantage of a Websocket is that web frontends can 'Watch' 
resource names. When a resource data changes the server will send (emit) the update via the Websocket. 
This is especially important for Web Frontends connected to the Ninja Auction Server; 
since they can Watch auction items and will notified of bid price changes. 
(Thus eliminating the 'polling' that would be required when using the REST interface.)


**Enough of the techie stuff**. Now for some SteamPunk fun! Auctions take place in the Victorian era - the age of steam powered machines 
made of gears, wheels, sprockets, and such. The architecture of auction operation and code itself is organized As 
commanded by Her Majesty :

-----

### 'Monarchy' - Her Majesty

 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/queen.svg" height="110" width="110" align="left">
 <br />The Queen -  has three trusted advisors; cyborg, ninja, and pirate. They live to do just as the queen commands.
 when it comes to the Kingdom's Gala Auction Event she commands her advisors when to gear up, start, suspend, and stop 
 the machines of the the auction. She also has the keys to the Kingdom - Trello, Google, S3, etc. 
 There are other activites she commands - such as sending out the RSVPs to guests,
 procuring of auction items, guest seating arrangements, etc.<br /><br />

-------

### Auction Advisors

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="64" width="64" />

Her Majesty calls them "Advisors" thus maintaining a resemblance of royality - but the minions and rest of the kingdom 
call them "bosses", so we shall too.

Auction Administrator setup, create, monitor, and manage auction guests and items.<br />
Auctioneer handles the auction itself including auction items, bids, buy-now, and bidder-to-bidder messaging.<br />
Treasurer handles payments and financials for items won by guests.

-------

### 'Cyborg' - Auction Administrator

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="80" width="80" align="left">
On startup - requests all interesting data from cards and comments for boards on Trello. 
The minions use the data to create a JSON database representing the cards and comments on the boards. 
If not already created, board level webhooks are created on Trello. Trello sends update events of user 
interaction with the Trello boards via the webhooks. Using the board and card ids given by the webhooks,
Cyborg commands the minions to request all interesting info for that card from Trello. 
The Minions update the JSON database with the response from Trello.

### 'Ninja' - Auctioneer

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="80" width="80" align="left">
Auction specific Frontends, web sites, and/or web pages connect via Websockets (for dynamic 
updates of auction item bid price updates). Bids can be placed via the RESTful or the WebSocket 
(socket.io) interface. Various item setup options available such as open, reserve, and incremental price.
<br /><br />

### 'Pirate' - Auction Treasurer

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="80" width="80" align="left">
Interfaces to Paypal/Credit Card Processors, Banks, etc. for payment of won auction items. 
 Produces invoices, receipts, statements, and financials for non-profit or for-profit organizations.
<br /><br /><br />

-------

### The Minions
<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/angel.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/nurse.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/architect.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/chef.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/clerk.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/constable.svg" height="64" width="64" />

-------
Similar to bosses - the Minions 'think' they exist in a physical universe; but sadly they are just Nodejs Modules. 
*mum's the word* - they might get wise and allow themselves to be forked, cloned, and zipped to work for other
open-source teams! ;( undoubtably resulting in a ton of GitHub issues - Minions have their own agenda and are not 
known to be all that developer friendly ).

Each Minion represents a task required of their boss. For example, the *Cyborg* boss *architect* 
<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/architect.svg" height="16" width="16" align="bottom"/> 
minion may be totally different code from the *Pirate* boss *architect* 
<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/architect.svg" height="16" width="16" align="bottom"/> 
minion. So each minion performs the basic tasks required, but are custom coded for the boss they represent.

-------

### The basic functions needed by all three bosses are:
<br />
<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/angel.svg" height="64" width="64" align="left">
 <p><b>angel</b> - Requests: make a request and pray it gets done.</p>

<br />
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/nurse.svg" height="64" width="64" align="left">
 <p><b>nurse</b> - System health: handles all errors thrown by system and insures data validation, integrity, and consistancy.</p>

<br />
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/architect.svg" height="64" width="64" align="left">
 <p><b>architect</b> - Object creation and destruction: creates, initializes, and deletes system objects and elements.</p>

<br />
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/chef.svg" height="64" width="64" align="left">
 <p><b>chef</b> - Reporting: performs data query, calculation, and report generation.</p>

<br />
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/clerk.svg" height="64" width="64" align="left">
 <p><b>clerk</b> - Distribution: organizes distribution of information between bosses, guests, and cloud.</p>

<br />
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/constable.svg" height="64" width="64" align="left">
 <p><b>constable</b> - Security: controls and ensures data access rights are enforced.</p>

-------

A thumbs-up to [Pixabay: Free Images](https://pixabay.com/) for providing [CC0 1.0 Universal Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) images - donate if you can!

