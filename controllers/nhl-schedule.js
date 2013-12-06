var csv = require("csv"),
    request = require("request"),
    async = require("async"),
    NHLGameBuilder = require("../model-builders/nhl-game-builder"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

var getScheduleUrl = function(team) {
    return "http://" + team + ".nhl.com/schedule/full.csv";
};

module.exports = function(app) {
    app.namespace("/api/nhl", function() {

        app.get("/teams/:team/schedule", function(req, res) {
            var team;

            team = req.params.team;

            Team.findOne({
                sport: "NHL",
                name: team
            }).populate("schedule").exec(function(err, team) {
                if (err) {
                    console.error(err);
                    res.send(500, err);
                    return;
                }

                if (team) {
                    res.send(team.schedule);
                } else {
                    res.send(404, "Team not found");
                }
            });
        });

        app.get("/teams/:team/update-schedule", function(req, res) {
            var teamName, nhlGames, nhlGameBuilder;

            teamName = req.params.team;
            nhlGames = [];
            nhlGameBuilder = new NHLGameBuilder();

            async.waterfall([
                // Get the schedule information
                function(callback) {
                    request.get(getScheduleUrl(teamName),
                        function(error, response, body) {
                            callback(null, body);
                        });
                },
                // Get the NHL team we're trying to load the schedule for
                function(csvString, callback) {
                    Team.findOne({
                        sport: "NHL",
                        name: teamName
                    }, function(err, team) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, csvString, team);
                        }
                    });
                },
                // Parse the schedule into individual games
                function(csvString, nhlTeam, callback) {
                    var valuesForNHLGames = [];

                    csv().from.string(csvString, {
                        delimiter: ",",
                        escape: '"'
                    })
                    // when a record is found in the CSV file (a row)
                    .on("record", function(row, index) {
                        var nhlGame;

                        // skip the header row
                        if (index === 0) {
                            return;
                        }

                        // store these values in an array to be processed later
                        // date, time, teams, location, networks
                        valuesForNHLGames.push({
                            date: row[0].trim(),
                            time: row[1].trim(),
                            teams: row[3].trim(),
                            location: row[4].trim(),
                            networks: row[5].trim()
                        });
                    })
                    // when the end of the CSV document is reached
                    .on("end", function() {
                        // call the next function with the values for these games
                        callback(null, valuesForNHLGames, nhlTeam);
                    })
                    // if any errors occur
                    .on("error", function(error) {
                        // call the callback with the error message
                        callback(error.message);
                    });
                },
                // Find or create each Game using the builder
                function(valuesForNHLGames, nhlTeam, callback) {
                    var count, nhlGames;

                    nhlGames = [];
                    count = 0;
                    // We gotta create these NHL games asynchronously,
                    // so use an inner async block
                    async.whilst(
                        function() {
                            return count < valuesForNHLGames.length;
                        },
                        function(whilstCallback) {
                            var nhlGameValues;

                            nhlGameValues = valuesForNHLGames[count];
                            count++;
                            // date, time, teams, location, networks
                            nhlGameBuilder.buildNHLGame(
                                app,
                                nhlGameValues.date,
                                nhlGameValues.time,
                                nhlGameValues.teams,
                                nhlGameValues.location,
                                nhlGameValues.networks,
                                function(err, nhlGame) {
                                    if (err) {
                                        whilstCallback(err);
                                    } else {
                                        // add the game to our list
                                        nhlGames.push(nhlGame);
                                        whilstCallback();
                                    }
                                });
                        },
                        function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, nhlGames, nhlTeam);
                            }
                        }
                    );
                },
                // Save the schedule to the team
                function(nhlGames, nhlTeam, callback) {
                    // store the games on the team
                    nhlTeam.schedule = nhlGames;
                    nhlTeam.save(function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            ], function(err, result) {
                if (err) {
                    console.log(err);
                    res.send(500, err);
                    return;
                }

                res.send("done!");
            });

        });
    });
};
