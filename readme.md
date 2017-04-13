## byatec

**B**est **Y**ielding **A**uction **T**ool **E**ver **C**reated

-----

[Onyx & Breezy Foundation](http://www.onyxandbreezy.org/) was created by Wanda and Mark Shefts to cherish
the memory of Onyx and Breezy to benefit the welfare of animals. All activities are volunteer, guaranteeing 
100% of contributions go to fulfill the goals of the Foundation dedicated to rescue animals from kill shelters;
provide food, medicine and supplies; support foster groups and sanctuaries; as well as 
assisting individuals where medical hardship is present.

Yearly, the Foundation has a Gala Event to increase awareness to the needs of animals. During the event,
items donated to the Foundation are put up for auction. Items in the past range from limited edition artwork,
a 'Signed Jack Nicklaus Masters Golf Tournament Scorecard', to a 'Pink Icing Cup Cake Microbead Pillow'!

The Foundation is building a mobile-ready online auction system to be used during this 
year's Event. If you wish to watch the project as it is being built you can visit 
[Oynx and Breezy Auction Development](https://trello.com/b/RpqBtWv2/onyx-and-breezy-auction-development) which
which is updated weekly with the tasks as they are being ( or not being ;) done.

For those interested (or wishing to contribute) to the code being written - visit the GitHub repository 
[byatc](https://github.com/PotOfCoffee2Go/byatc). The server side code-base is expected to 
be completed by May 1st, 2017 - at which time the REST API and WebSocket documentation for front-end development
to the auction will be available.


-----

**Introduction stuff aside!**. Now, for some real SteamPunk fun! The Onyx and Breezy Auction takes place in the Victorian era
- back in the age of gears, wheels, wires, sprockets, and such. The auction operation (and code itself) is organized
As commanded by Her Majesty, the Queen :

-----

### 'Monarchy'

#### Her Majesty
`/monarchy/queen.js`

 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/queen.svg" height="110" width="110" align="left">
 <br />The Queen - has Princesses and trusted Advisors to run the yearly <b>Kingdom Gala Event</b>, which, along with
 guests dancing, rubbing elbows, networking, and partying; a live auction of rare and exquisite items are put up for bid.
 Princesses and advisors live to do as the Queen commands and make available to guests items for auction by cell phone.
 
The Queen also has the keys to the Kingdom - credentials needed by Princesses Trello, Sheets, Twitter, Facebook, etc. to
do as the Queen commands. The Queen is also intimately involved with sending out the RSVPs to guests, procuring of auction
items, guest seating arrangements, etc.<br /><br />

-------

#### Princesses

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/princesstrello.svg" height="64" width="64" align="left"><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/princesssheets.svg" height="64" width="64" align="left">
 
 <br /> <br /> <br /> Under the Queen are the Princesses who are given the task of insuring that the yearly 
 <b>Kingdom's Gala Event</b> runs smoothly. The Princesses gather auction information and send guests updates
 about the auction as it is running.
 
-----

#### Princess Trello
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/princesstrello.svg" height="80" width="80" align="left">
 Princess Trello - monitors the activities of auction guests, if a guest gets on the wrong side of the Queen, they
 could be excluded from bidding on items up for auction (It is nice to be the Queen). By setting flags on the auction
 <a href="https://trello.com/">Trello</a> boards one controls guest access to the auction. <br /><br /><br />

`/monarchy/princess/trello directory`


#### Princess Sheets
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/princesssheets.svg" height="80" width="80" align="left">
 Princess Sheets - is responsible for all information about guests and items up for bid. When the auction starts
 Princess Sheets gives the guest and item list to the Advisors' - who register guests and puts 
 items on the auction block. She also updates the financial reports for items won at auction.
 <br /><br /><br />

`/monarchy/princess/sheets directory`


<b> ToDo: Prince SMS, Facebook and Twitter </b>

-------

### Auction Advisors

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="64" width="64" /><img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="64" width="64" />

Her Majesty calls them "Advisors" thus maintaining a resemblance of royality - but the minions and rest of the kingdom 
call them <b>bosses</b>, so we shall too.

<b>Administrator</b> sets up, creates, monitors, and manages auction guests and items.<br />
<b>Auctioneer</b> handles the auction itself. Auction items, bids, buy-now, and bidder-to-bidder messaging.<br />
<b>Accountant</b> handles online payments and financials for items won by guests.

-------

### 'Cyborg' - Auction Administrator
`/bosses/cyborg directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/cyborg.svg" height="80" width="80" align="left">
When the Queen commands for the auction to begin, Cyborg kicks Ninja and Pirate in the butt - get ready for work! Gear the 
machinery and fire up the steam engines! Princess Sheets provides the data about auction guests and items.
Princess Trello creates the boards used to monitor the auction. Cyborg's architect sets up the intercom system
between the bosses. A flury of activity occurs among each boss's minions preparing for the auction. The big day has arrived!

### 'Ninja' - Auctioneer
`/bosses/ninja directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/ninja.svg" height="80" width="80" align="left">
The Auctioneer gargles and clears his throat - readying for auction. His minions run around gathering and writing on
blackboards each item's status; starting, incremental, and buy-now prices. Ready to take the bids from guests of the
Queen's Gala Event.

<br /><br />

### 'Pirate' - Auction Accountant
`/bosses/pirate directory`

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/pirate.svg" height="80" width="80" align="left">
Although is of questionable character, the Queen commands via cyborg that 'Pirate' is to handle the Checkout
process for items purchased during the event. The Pirate insures he can communicate to Paypal, Credit Card Processors, Banks, etc.
to process payment of items won on auction. He prepares minions to produce invoices, receipts, statements, and financial
reports for distribution to Princess Sheets... Then goes back to bed.
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

### The Minions do the tasks required by the auction system

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/angel.svg" height="64" width="64" align="left">
 <p><b>angel</b> - Requests: make a request and pray it gets done.</p>

<br />

 `/minion/angel.js`

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/nurse.svg" height="64" width="64" align="left">
 <p><b>nurse</b> - System health: handles all errors thrown by system and insures data validation, integrity, and consistancy.</p>

<br />

 `/minion/nurse.js`

<br />
 
 <img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/architect.svg" height="64" width="64" align="left">
 <p><b>architect</b> - Object creation and destruction: creates, initializes, and deletes system objects and elements.</p>

<br />

 `/minion/architect.js`
 
<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/chef.svg" height="64" width="64" align="left">
 <p><b>chef</b> - Reporting: performs data query, calculation, and report generation.</p>

<br />

 `/minion/chef.js`

<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/clerk.svg" height="64" width="64" align="left">
 <p><b>clerk</b> - Database Management: store and access information for princesses, bosses, and minions.</p>

<br />

 `/minion/clerk.js`
 
<br />

<img src="https://s3.amazonaws.com/potofcoffee2go/byatc/images/constable.svg" height="64" width="64" align="left">
 <p><b>constable</b> - Security: Verifies guest credentials, controls and ensures data access rights are enforced.</p>

<br />

 `/minion/constable.js`

-------




A thumbs-up to [Pixabay: Free Images](https://pixabay.com/) for providing [CC0 1.0 Universal Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) images - donate if you can!

