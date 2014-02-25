# game-manager #

Provides a way to keep track of games available to watch, by tracking team schedules and
blackout dates. This is done on a per-user basis, so each user has a list of available
games, and can add details on the game currently being watched (current inning/quarter/period)
along with specifying if the game has been watched.

## Authentication ##

All routes under <code>/api</code> require an authenticated user (all users are authorized).
A user is modeled via Mongoose and the
<a href="https://github.com/dylants/game-manager/blob/master/models/user.js">
<code>User</code></a> schema. To create a user, execute the following code:

```JavaScript
var User = require("mongoose").model("User");

var user = new User({
    username: "my_user_name",
    password: "my_user_password"
});
user.save();
```
After which you can navigate to the game manager UI to login (at
<code>/game-manager/login</code>) using the username and password specified above. Note that
this is required to access almost all function within the application.

## Teams ##

Teams are defined, by sport, in the <code>config.yaml</code> file. This file contains a list
of teams for the sport, along with details on that team (name, conference, division, logo, etc).
During initial setup, these teams can be imported into the database:

### Import NHL Teams ###

To import NHL teams, navigate to <code>/api/nhl/import-teams</code>. This
will loop over the NHL teams and add each to the backend database, using the
<a href="https://github.com/dylants/game-manager/blob/master/models/team.js">
<code>Team</code></a> Mongoose schema. This only needs to be done once.

### Import NBA Teams ###

To import NBA teams, navigate to <code>/api/nba/import-teams</code>. This
will loop over the NBA teams and add each to the backend database, using the
<a href="https://github.com/dylants/game-manager/blob/master/models/team.js">
<code>Team</code></a> Mongoose schema. This only needs to be done once.

## Team Schedule ##

Once the teams for the sport are imported,
<a href="https://github.com/dylants/game-manager/blob/master/models/game.js">
<code>Game</code></a>s can be created for each team's schedule. <code>Game</code>s
are created by first reading a team's schedule online (usually via a CSV file) and
importing that data into a <code>Game</code>. A new <code>Game</code> is only
created if one does not exist (games are shared between two teams). After the
initial creation of a <code>Team</code>'s <code>Game</code>s, updating the
<code>Game</code>s can be done at any time (since a team's schedule may
change throughout the season).

### Import/Update an NHL Team's Schedule ###

To import/update an NHL team's schedule, navigate to
<code>/api/nhl/teams/{teamName}/update-schedule</code> where <code>{teamName}</code> is the
name of the team's schedule to update. For instance, to import the San Jose Sharks'
schedule, navigate to <code>/api/nhl/teams/sharks/update-schedule</code>.

### Import/Update an NBA Team's Schedule ###

To import/update an NBA team's schedule, navigate to
<code>/api/nba/teams/{teamName}/update-schedule</code> where <code>{teamName}</code> is the
name of the team's schedule to update. For instance, to import the Boston Celtics'
schedule, navigate to <code>/api/nhl/teams/celtics/update-schedule</code>.

## Tracking a Team's Schedule ##

With teams and team schedules imported, a <code>User</code> can track a <code>Team</code>'s
<code>Game</code>s by adding the <code>Team</code> to those tracked by the <code>User</code>.
To do so, navigate to the UI, login, and add the team. More information to follow...

