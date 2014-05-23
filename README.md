# game-manager #

<img src="https://cloud.githubusercontent.com/assets/1596740/3062314/0af4e9ac-e21b-11e3-9db0-513c65a526a9.png">

This application came about because of all the online sport packages available (MLB.tv,
NHL Game Center, NBA League Pass, etc). These are great, and allow you to follow your
favorite team even without cable TV. One problem with these is understanding which game
is blacked out and not available until hours later, or which games someone can have
available to watch at any given time (games tend to build up in a queue this way).

The game-manager application provides a way to keep track of these games that are
available to watch, by tracking team schedules along with the game blackout dates (and
posting when the game *will* be available to watch). Each user initially selects the
teams they would like to follow, and games are populated on a game queue page. The user
can add game notes (where they are in the game) so they can easily return to the game
later. The user can also marked a game as "watched" which will move it to an archive
section, removing it from the available games to watch. Upcoming games and game times
are displayed as well.

## Initial Setup ##

The game-manager application is a Node.js application, and as such, requires Node.js.
With Node installed, install dependencies with the command: <code>npm install</code>.

This application requires a Mongo database to store teams, games, and users
of the system. The application expects the Mongo database to be available locally, and
uses the database name "game". No authentication is expected, just simply start
the Mongo database.

This application comes with a configuration file which specifies all the teams for each
sport, along with logos and other team attributes. A setup file has been created which
will iterate over this file and create each team in the Mongo database. This is only
necessary initially to populate the database with all available teams.

The setup configuration file also creates a user which you would use to login and
track team games. The username and password for this user should be specified in the
setup file (one has been specified for you with username "my_user_name" and password
"my_user_password").

Open up the setup.js file found in the root directory of this project, and update
any configuration options you would like to change. To execute the file, run
<code>node setup.js</code> from the same directory. Be sure and have the Mongo
database up and running locally prior to running the setup.

Once setup is complete, you can start the application using <code>npm start</code>
or <code>node app.js</code>.

## Game Manager UI ##

With the application running, navigate to it from a browser (for instance, running
it locally will launch the application on http://localhost:3000). You will be prompted
to login with the username/password created during the setup process above. Once
logged in, you can navigate to the Teams section to select teams you would like to
track. (Selecting a team also adds the games for the team to the Mongo database.) With
the teams selected, navigate to the Games section to see the list of Available, Upcoming,
and Archived games for your user.

Add game notes when watching a game to keep track of the current inning/period/quarter
you are watching, so that you can return to it later. Mark a game as "watched" to move
it from Available to Archived. View Upcoming games to see future games available and
their time and date. Blacked out games will be marked with two times, the first is the
actual game time (marked lighter) and the second is the available time to watch.
