## byatec

**B**est **Y**ielding **A**uction **T**ool **E**ver **C**reated

-----

Byatec is a live event auction system that reads guest, item, and category 
information from Google Sheets spreadsheets. The data from the sheets is used to 
create Trello Boards to assist in organizing guest RSVPs, seating arrangements,
item categories and uploading of item and category images.

The hierarchy of the system is designed based on a Victorian Era Monarchy. Although
on first look, seems silly - it does organize the different tasks required by the
auction system. Not only effective but is fun too! Especially those that get into 
steampunk!

For technical info goto the documentation on the sample 
[byatec system api](https://byatc-potofcoffee2go.c9users.io/api).

-----

Install by `npm install byatec -g`. This will install a default configuraton which
will run using data from sample Google spreadsheets. The system is functional but
can not update the spreadsheets or build the Trello boards until the configuraton
is updated with credentials, keys, and secrets allowing access to your Google and
Trello accounts.



-----


### 'Monarchy'

#### Her Majesty
`/monarchy/queen.js`

 <img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/queen.svg" height="110" width="110" align="left">
 <br />The Queen - has Princesses and trusted Advisors to run the yearly <b>Kingdom Gala Event</b>, which, along with
 guests dancing, rubbing elbows, networking, and partying; a live auction of rare and exquisite items are put up for bid.
 Princesses and advisors live to do as the Queen commands and make available to guests items for auction by cell phone.
 
The Queen also has the keys to the Kingdom - credentials needed by Princesses Trello, Sheets, Twitter, Facebook, etc. to
do as the Queen commands. The Queen is also intimately involved with sending out the RSVPs to guests, procuring of auction
items, guest seating arrangements, etc.<br /><br />

-------

#### Princesses

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/princesstrello.svg" height="64" width="64" align="left"><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/princesssheets.svg" height="64" width="64" align="left">
 
 <br /> <br /> <br /> Under the Queen are the Princesses who are given the task of insuring that the yearly 
 <b>Kingdom's Gala Event</b> runs smoothly. The Princesses gather auction information and send guests updates
 about the auction as it is running.
 
-----

#### Princess Trello
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/princesstrello.svg" height="80" width="80" align="left">
 Princess Trello - monitors the activities of auction guests, if a guest gets on the wrong side of the Queen, they
 could be excluded from bidding on items up for auction (It is nice to be the Queen). By setting flags on the auction
 <a href="https://trello.com/">Trello</a> boards one controls guest access to the auction. <br /><br /><br />

`/monarchy/princess/trello directory`


#### Princess Sheets
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/princesssheets.svg" height="80" width="80" align="left">
 Princess Sheets - is responsible for all information about guests and items up for bid. When the auction starts
 Princess Sheets gives the guest and item list to the Advisors' - who register guests and puts 
 items on the auction block. She also updates the financial reports for items won at auction.
 <br /><br /><br />

`/monarchy/princess/sheets directory`


<b> ToDo: Prince SMS, Facebook and Twitter </b>

-------

### Auction Advisors

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/cyborg.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/ninja.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/pirate.svg" height="64" width="64" />

Her Majesty calls them "Advisors" thus maintaining a resemblance of royality - but the minions and rest of the kingdom 
call them <b>bosses</b>, so we shall too.

<b>Administrator</b> sets up, creates, monitors, and manages auction guests and items.<br />
<b>Auctioneer</b> handles the auction itself. Auction items, bids, buy-now, and bidder-to-bidder messaging.<br />
<b>Accountant</b> handles online payments and financials for items won by guests.

-------

### 'Cyborg' - Auction Administrator
`/bosses/cyborg directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/cyborg.svg" height="80" width="80" align="left">
When the Queen commands for the auction to begin, Cyborg kicks Ninja and Pirate in the butt - get ready for work! Gear the 
machinery and fire up the steam engines! Princess Sheets provides the data about auction guests and items.
Princess Trello creates the boards used to monitor the auction. Cyborg's architect sets up the intercom system
between the bosses. A flury of activity occurs among each boss's minions preparing for the auction. The big day has arrived!

### 'Ninja' - Auctioneer
`/bosses/ninja directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/ninja.svg" height="80" width="80" align="left">
The Auctioneer gargles and clears his throat - readying for auction. His minions run around gathering and writing on
blackboards each item's status; starting, incremental, and buy-now prices. Ready to take the bids from guests of the
Queen's Gala Event.

<br /><br />

### 'Pirate' - Auction Accountant
`/bosses/pirate directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/pirate.svg" height="80" width="80" align="left">
Although is of questionable character, the Queen commands via cyborg that 'Pirate' is to handle the Checkout
process for items purchased during the event. The Pirate insures he can communicate to Paypal, Credit Card Processors, Banks, etc.
to process payment of items won on auction. He prepares minions to produce invoices, receipts, statements, and financial
reports for distribution to Princess Sheets... Then goes back to bed.
<br /><br /><br />

-------

### The Minions
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/angel.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/nurse.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/architect.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/chef.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/clerk.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/crier.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/constable.svg" height="64" width="64" />

-------
Similar to bosses - the Minions 'think' they exist in a physical universe; but sadly they are just Nodejs Modules. 
*mum's the word* - they might get wise and allow themselves to be forked, cloned, and zipped to work for other
open-source teams! ;( undoubtably resulting in a ton of GitHub issues - Minions have their own agenda and are not 
known to be all that developer friendly ).

Each Minion represents a task required of their boss. For example, the *Cyborg* boss *architect* 
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/architect.svg" height="16" width="16" align="bottom"/> 
minion may be totally different code from the *Pirate* boss *architect* 
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/architect.svg" height="16" width="16" align="bottom"/> 
minion. So each minion performs the basic tasks required, but are custom coded for the boss they represent.

-------

### The Minions do the tasks required by the auction system

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/angel.svg" height="64" width="64" align="left">
 <p><b>angel</b> - Requests: make a request and pray it gets done.</p>

<br />

 `/minion/angel.js`

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/nurse.svg" height="64" width="64" align="left">
 <p><b>nurse</b> - System health: handles all errors thrown by system and insures data validation, integrity, and consistancy.</p>

<br />

 `/minion/nurse.js`

<br />
 
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/architect.svg" height="64" width="64" align="left">
 <p><b>architect</b> - Object creation and destruction: creates, initializes, and deletes system objects and elements.</p>

<br />

 `/minion/architect.js`
 
<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/chef.svg" height="64" width="64" align="left">
 <p><b>chef</b> - Reporting: performs data query, calculation, and report generation.</p>

<br />

 `/minion/chef.js`

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/clerk.svg" height="64" width="64" align="left">
 <p><b>clerk</b> - Database Management: store and access information for princesses, bosses, and minions.</p>

<br />

 `/minion/clerk.js`
 
<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/crier.svg" height="64" width="64" align="left">
 <p><b>town crier</b> - Announces up-to-date news about the auction, guests, and item bid prices.</p>

<br />

 `/minion/crier.js`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/constable.svg" height="64" width="64" align="left">
 <p><b>constable</b> - Security: Verifies guest credentials, controls and ensures data access rights are enforced.</p>

<br />

 `/minion/constable.js`

-------

### The Realms
The Monarchy Empire is divided into Realms. There is an API, auction, docs, pages, etc. realms which have the
job of producing information to patrons of the empire.

#### Auction Realm
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/auction.png" height="45" width="64" align="left">
The `auction` realm contains pages which patrons or guests can register, authenticate, and make bids on
items up for auction. Most patrons create their own pages, but the built-in pages are used for
testing the auction system.

#### Api Realm
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/api.jpg" height="45" width="64" align="left">
The API informs patrons how to get auction data if they wish to create their own pages.

#### Docs Realm
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/documents.png" height="57" width="64" align="left">
The codexes and scrolls of the empire are contained in the Docs realm.<br>

#### Db Realm
<img src="https://s3.amazonaws.com/potofcoffee2go/byatec/images/databases.png" height="55" width="64" align="left">
Data about the auction are contained in the DB realm, which is dynamically created
from information provided by Princess Sheets.
<br /><br /><br />

----

A thumbs-up to [Pixabay: Free Images](https://pixabay.com/) for providing [CC0 1.0 Universal Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) images - donate if you can!

