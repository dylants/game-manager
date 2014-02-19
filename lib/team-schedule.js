var async = require("async"),
    request = require("request"),
    csv = require("csv"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

module.exports = {
    update: function(scheduleUrl, sport, teamName, rows, gameBuilder, app, callback) {
        async.waterfall([
            // Get the schedule information
            function(waterfallCallback) {
                request.get(scheduleUrl, function(error, response, body) {
                    waterfallCallback(null, body);
                });
            },
            // Get the team we're trying to load the schedule for
            function(csvString, waterfallCallback) {
                Team.findOne({
                    sport: sport,
                    name: teamName
                }, function(err, team) {
                    if (err) {
                        waterfallCallback(err);
                    } else {
                        waterfallCallback(null, csvString, team);
                    }
                });
            },
            // Parse the schedule into individual games
            function(csvString, team, waterfallCallback) {
                var valuesForGames = [];

                csv().from.string(csvString, {
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
                        date: row[rows.date].trim(),
                        time: row[rows.time].trim(),
                        teams: row[rows.teams].trim(),
                        location: row[rows.location].trim(),
                        description: row[rows.description].trim()
                    });
                })
                // when the end of the CSV document is reached
                .on("end", function() {
                    // call the next function with the values for these games
                    waterfallCallback(null, valuesForGames, team);
                })
                // if any errors occur
                .on("error", function(error) {
                    // call the waterfallCallback with the error message
                    waterfallCallback(error.message);
                });
            },
            // Find or create each Game using the builder
            function(valuesForGames, team, waterfallCallback) {
                var count, games;

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
                            waterfallCallback(err);
                        } else {
                            waterfallCallback(null, games, team);
                        }
                    }
                );
            },
            // Save the schedule to the team
            function(games, team, waterfallCallback) {
                // store the games on the team
                team.schedule = games;
                team.save(function(err) {
                    if (err) {
                        waterfallCallback(err);
                    } else {
                        waterfallCallback(null);
                    }
                });
            }
        ], function(err) {
            callback(err);
        });
    }
};
