var async = require("async"),
    request = require("request"),
    csv = require("csv"),
    NHLGameBuilder = require("../lib/nhl-game-builder"),
    NBAGameBuilder = require("../lib/nba-game-builder"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

function getScheduleUrl(sport, team) {
    if (sport === "NHL") {
        return "http://" + team + ".nhl.com/schedule/full.csv";
    } else if (sport === "NBA") {
        return "http://www.nba.com/" + team + "/schedule/2013/schedule.csv";
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
    } else {
        console.error("Unrecognized sport: " + sport);
        return null;
    }
}

function getRowHeaderIndexes(sport) {
    if (sport === "NHL") {
        return {
            date: 0,
            time: 1,
            teams: 3,
            location: 4,
            description: 5
        };
    } else if (sport === "NBA") {
        return {
            date: 1,
            time: 2,
            teams: 0,
            location: 3,
            description: 4
        };
    } else {
        console.error("Unrecognized sport: " + sport);
        return null;
    }
}

function getSchedule(scheduleUrl, callback) {
    request.get(scheduleUrl, function(error, response, body) {
        if (error) {
            callback(error);
        } else {
            callback(null, body);
        }
    });
}

function loadGameValues(scheduleUrl, rowHeaderIndexes, callback) {
    // first get the schedule information
    getSchedule(scheduleUrl, function(err, scheduleCSV) {
        var valuesForGames = [];

        if (err) {
            callback(err);
            return;
        }

        csv().from.string(scheduleCSV, {
            delimiter: ",",
            escape: '"'
        })
        // when a record is found in the CSV file (a row)
        .on("record", function(row, index) {
            // skip the header row
            if (index === 0) {
                return;
            }

            // store these values in an array to be processed later
            // date, time, teams, location, networks
            valuesForGames.push({
                date: row[rowHeaderIndexes.date].trim(),
                time: row[rowHeaderIndexes.time].trim(),
                teams: row[rowHeaderIndexes.teams].trim(),
                location: row[rowHeaderIndexes.location].trim(),
                description: row[rowHeaderIndexes.description].trim()
            });
        })
        // when the end of the CSV document is reached
        .on("end", function() {
            // call the next function with the values for these games
            callback(null, valuesForGames);
        })
        // if any errors occur
        .on("error", function(error) {
            // call the callback with the error message
            callback(error.message);
        });
    });
}

function buildGames(sport, team, app, callback) {
    var scheduleUrl, rowHeaderIndexes;

    scheduleUrl = getScheduleUrl(sport, team);
    rowHeaderIndexes = getRowHeaderIndexes(sport);

    // grab the game values from the schedule
    loadGameValues(scheduleUrl, rowHeaderIndexes, function(err, valuesForGames) {
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
                // date, time, teams, location, description
                gameBuilder.buildGame(
                    app,
                    gameValues.date,
                    gameValues.time,
                    gameValues.teams,
                    gameValues.location,
                    gameValues.description,
                    function(err, game) {
                        if (err) {
                            whilstCallback(err);
                        } else {
                            // add the game to our list
                            games.push(game);
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
     * @param  {[type]}   app         The Express app
     * @param  {Function} callback    Called when the update is complete, with optional
     *                                error
     */
    update: function(sport, teamName, app, callback) {
        async.waterfall([
            // Build the games and load the team
            function(waterfallCallback) {
                async.parallel([
                        function(parallelCallback) {
                            buildGames(sport, teamName, app, parallelCallback);
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
