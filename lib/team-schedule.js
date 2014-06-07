"use strict";

var async = require("async"),
    request = require("request"),
    ical = require("ical"),
    _ = require("underscore"),
    time = require("time"),
    moment = require("moment"),
    NHLGameBuilder = require("../lib/nhl-game-builder"),
    NBAGameBuilder = require("../lib/nba-game-builder"),
    MLBGameBuilder = require("../lib/mlb-game-builder"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

function getScheduleUrl(sport, team, teamId) {
    if (sport === "NHL") {
        return "http://" + team + ".nhl.com/schedule/full.ics";
    } else if (sport === "NBA") {
        return "http://www.nba.com/" + team + "/schedule/2013/schedule.ics";
    } else if (sport === "MLB") {
        return "http://mlb.mlb.com/soa/ical/schedule.ics?team_id=" + teamId + "&season=2014";
    } else {
        console.error("Unrecognized sport: " + sport);
        return null;
    }
}

function getGameBuilder(sport) {
    if (sport === "NHL") {
        return new NHLGameBuilder();
    } else if (sport === "NBA") {
        return new NBAGameBuilder();
    } else if (sport === "MLB") {
        return new MLBGameBuilder();
    } else {
        console.error("Unrecognized sport: " + sport);
        return null;
    }
}

function loadGameValues(scheduleUrl, callback) {
    // first get the schedule information (with no additional
    // parameters to the request call specified by the empty object)
    ical.fromURL(scheduleUrl, {}, function(err, data) {
        var dataKeys, i, entry, valuesForGames;

        if (err) {
            callback(err);
            return;
        }

        valuesForGames = [];
        dataKeys = _.keys(data);

        for (i = 0; i < dataKeys.length; i++) {
            entry = data[dataKeys[i]];
            if (entry && entry.type && entry.type === "VEVENT") {
                // store these values in an array to be processed later
                // date, teams, location, networks.
                // Note that the date is set in the New York (Eastern Time)
                // time zone, so we should set it as such
                valuesForGames.push({
                    date: new time.Date(entry.start, "America/New_York"),
                    teams: entry.summary,
                    location: entry.location,
                    description: entry.description
                });
            }
        }

        // call the next function with the values for these games
        callback(null, valuesForGames);
    });
}

function buildGames(sport, team, teamId, app, callback) {
    var scheduleUrl;

    scheduleUrl = getScheduleUrl(sport, team, teamId);

    // grab the game values from the schedule
    loadGameValues(scheduleUrl, function(err, valuesForGames) {
        var gameBuilder, count, games;

        if (err) {
            callback(err);
            return;
        }

        gameBuilder = getGameBuilder(sport);

        games = [];
        count = 0;
        // We gotta create these games asynchronously,
        // so use an inner async block
        async.whilst(
            function() {
                return count < valuesForGames.length;
            },
            function(whilstCallback) {
                var gameValues;

                gameValues = valuesForGames[count];
                count++;

                // if the date or teams is not available, skip this game
                if (!gameValues.date || !gameValues.teams) {
                    console.error("game information not available, skipping game");
                    return whilstCallback();
                }

                // if the date is malformed, skip this game
                try {
                    moment(gameValues.date);
                } catch (error) {
                    console.error("date is not valid, skipping game");
                    return whilstCallback();
                }

                // date, teams, location, description
                gameBuilder.buildGame(
                    app,
                    gameValues.date,
                    gameValues.teams,
                    gameValues.location,
                    gameValues.description,
                    function(err, game) {
                        if (err) {
                            whilstCallback(err);
                        } else {
                            // account for a no-op game, by only adding
                            // games that exist (that are returned from
                            // the game builder)
                            if (game) {
                                // add the game to our list
                                games.push(game);
                            }
                            whilstCallback();
                        }
                    });
            },
            function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, games);
                }
            }
        );
    });
}

function loadTeam(sport, teamName, callback) {
    Team.findOne({
        sport: sport,
        name: teamName
    }, function(err, team) {
        if (err) {
            callback(err);
        } else {
            callback(null, team);
        }
    });
}

function updateTeamSchedule(team, games, callback) {
    // store the games on the team's schedule
    team.schedule = games;
    team.save(function(err) {
        callback(err);
    });
}

module.exports = {

    /**
     * Updates a Team's schedule
     * @param  {String}   sport       The sport for the team
     * @param  {String}   teamName    The name of the team
     * @param  {Number}   teamId      The team ID for the team
     * @param  {[type]}   app         The Express app
     * @param  {Function} callback    Called when the update is complete, with optional
     *                                error
     */
    update: function(sport, teamName, teamId, app, callback) {
        async.waterfall([
            // Build the games and load the team
            function(waterfallCallback) {
                async.parallel([
                        function(parallelCallback) {
                            buildGames(sport, teamName, teamId, app, parallelCallback);
                        },
                        function(parallelCallback) {
                            loadTeam(sport, teamName, parallelCallback);
                        }
                    ],
                    function(err, results) {
                        if (err) {
                            waterfallCallback(err);
                        } else {
                            // call the next function passing in the games and team
                            waterfallCallback(null, results[0], results[1]);
                        }
                    });
            },
            // Save the schedule to the team
            function(games, team, waterfallCallback) {
                updateTeamSchedule(team, games, waterfallCallback);
            }
        ], function(err) {
            callback(err);
        });
    }

};
