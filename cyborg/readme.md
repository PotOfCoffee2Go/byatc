# ninja

## byatc

**B**est **Y**ielding **A**uction **T**ool **C**reated

-----
### 'Cyborg' - Auction Administration

 <img src="https://cdn.rawgit.com/PotOfCoffee2Go/byatc/8d22340b/www/images/pac/cyborg.png" height="80" width="80" align="left">
 <p>On startup - requests all interesting data from cards and comments for boards on Trello. The minions use the data to create a JSON database representing the cards and comments on the boards. If not already created, board level webhooks are created on Trello. Trello sends update events of user interaction with the Trello boards via the webhooks. Using the board and card ids given by the webhooks, Cyborg commands the minions to request all interesting info for that card from Trello. The Minions update the JSON database with the response from Trello.</p>

