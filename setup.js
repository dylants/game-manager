/**
 * This is a setup file which will setup the environment for the
 * Game Manager application. The main responsibilities of this setup
 * file is to import the teams from the configuration into the
 * Mongo database, and create the User which you will use. Update
 * the configuration settings below to make any changes to this
 * setup execution. Once the configuration is to your liking, run
 * this file as:
 *
 * node setup.js
 */

/////////////////////////
// BEGIN CONFIGURATION //
/////////////////////////

// Import the Teams
var IMPORT_TEAMS = true;

// Create a User
var CREATE_USER = true;

// Username and password for the user that will be created
var USERNAME = "my_user_name";
var PASSWORD = "my_user_password";

///////////////////////
// END CONFIGURATION //
///////////////////////


// load dependencies for the setup module
var mongoose = require("mongoose"),
    async = require("async"),
    yaml = require("js-yaml"),
    fs = require("fs"),
    config = yaml.safeLoad(fs.readFileSync("./config.yaml", "utf8"));

// connect to our mongo database
mongoose.connect("mongodb://localhost/game", function(error) {
    // handle the error case
    if (error) {
        console.error("Failed to connect to the Mongo server!!");
        console.error(error);
        throw error;
    }
});


////////////////////////////////////////////////
// Code to import teams into the Game Manager //
////////////////////////////////////////////////


// load the Team model
require("./models/team");
var Team = mongoose.model("Team");

/**
 * Imports teams of a specified sport into the database
 *
 * @param  {String}   sport    The team's sport
 * @param  {Function} callback Called when importing is complete, with optional error argument
 */

function importTeams(sport, callback) {
    var sportConfig, teams, count;

    console.log("Importing teams for sport: " + sport + "...");

    if (sport === "NHL") {
        sportConfig = config.nhl;
    } else if (sport === "NBA") {
        sportConfig = config.nba;
    } else if (sport === "MLB") {
        sportConfig = config.mlb;
    } else {
        callback("Unrecognized sport: " + sport);
        return;
    }

    teams = sportConfig.teams;
    count = 0;
    async.whilst(
        function() {
            return count < teams.length;
        },
        function(whilstCallback) {
            var team, teamModel;

            team = teams[count];
            count++;
            teamModel = new Team({
                // name is the lowercase, trimmed mascot
                name: team.mascot.toLowerCase().replace(/\s*/g, ""),
                city: team.city,
                mascot: team.mascot,
                sport: sport,
                conference: team.conference,
                division: team.division,
                logoHref: team.logoHref,
                teamId: team.teamId
            });
            teamModel.save(function(err) {
                whilstCallback(err);
            });
        },
        function(err) {
            callback(err);
        }
    );
}


//////////////////////////////////////////
// Code to create user for Game Manager //
//////////////////////////////////////////


// load in the User model
require("./models/user");
var User = mongoose.model("User");

/**
 * Creates a single user for the game-manager application
 * @param  {Function} callback Called when importing is complete, with optional error argument
 */

function createUser(callback) {
    console.log("Creating user (this may take a few seconds)...");
    var user = new User({
        username: USERNAME,
        password: PASSWORD
    });
    user.save(function(err) {
        callback(err);
    });
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
// Run all the setup necessary for the game-manager application //
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

var functions = [];

if (IMPORT_TEAMS) {
    functions.push(
        function(parallelCallback) {
            importTeams("NHL", parallelCallback);
        },
        function(parallelCallback) {
            importTeams("NBA", parallelCallback);
        },
        function(parallelCallback) {
            importTeams("MLB", parallelCallback);
        }
    );
}

if (CREATE_USER) {
    functions.push(
        function(parallelCallback) {
            createUser(parallelCallback);
        }
    );
}

if (functions.length > 0) {
    async.parallel(functions,
        function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Setup successful!");
            }
            process.exit();
        }
    );
} else {
    console.log("Setup complete, but nothing was done (did you mean to enable something " +
        "in the configuration of this file?)");
    process.exit();
}
