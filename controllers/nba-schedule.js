var csv = require("csv"),
    request = require("request"),
    async = require("async"),
    NBAGameBuilder = require("../model-builders/nba-game-builder"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

var getScheduleUrl = function(team) {
    return "http://www.nba.com/" + team + "/schedule/2013/schedule.csv";
};

module.exports = function(app) {
    app.namespace("/api/nba", function() {

        app.get("/teams/:team/schedule", function(req, res) {
            var team;

            team = req.params.team;

            Team.findOne({
                sport: "NBA",
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
            var teamName, nbaGames, nbaGameBuilder;

            teamName = req.params.team;
            nbaGames = [];
            nbaGameBuilder = new NBAGameBuilder();

            async.waterfall([
                // Get the schedule information
                function(callback) {
                    request.get(getScheduleUrl(teamName),
                        function(error, response, body) {
                            callback(null, body);
                        });
                },
                // Get the NBA team we're trying to load the schedule for
                function(csvString, callback) {
                    Team.findOne({
                        sport: "NBA",
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
                function(csvString, nbaTeam, callback) {
                    var valuesForNBAGames = [];

                    csv().from.string(csvString, {
                        delimiter: ",",
                        escape: '"'
                    })
                    // when a record is found in the CSV file (a row)
                    .on("record", function(row, index) {
                        var nbaGame;

                        // skip the header row
                        if (index === 0) {
                            return;
                        }

                        // store these values in an array to be processed later
                        // date, time, teams, location, networks
                        valuesForNBAGames.push({
                            date: row[1].trim(),
                            time: row[2].trim(),
                            teams: row[0].trim(),
                            location: row[3].trim(),
                            description: row[4].trim()
                        });
                    })
                    // when the end of the CSV document is reached
                    .on("end", function() {
                        // call the next function with the values for these games
                        callback(null, valuesForNBAGames, nbaTeam);
                    })
                    // if any errors occur
                    .on("error", function(error) {
                        // call the callback with the error message
                        callback(error.message);
                    });
                },
                // Find or create each Game using the builder
                function(valuesForNBAGames, nbaTeam, callback) {
                    var count, nbaGames;

                    nbaGames = [];
                    count = 0;
                    // We gotta create these NBA games asynchronously,
                    // so use an inner async block
                    async.whilst(
                        function() {
                            return count < valuesForNBAGames.length;
                        },
                        function(whilstCallback) {
                            var nbaGameValues;

                            nbaGameValues = valuesForNBAGames[count];
                            count++;
                            // date, time, teams, location, description
                            nbaGameBuilder.buildNBAGame(
                                nbaGameValues.date,
                                nbaGameValues.time,
                                nbaGameValues.teams,
                                nbaGameValues.location,
                                nbaGameValues.description,
                                function(err, nbaGame) {
                                    if (err) {
                                        whilstCallback(err);
                                    } else {
                                        // add the game to our list
                                        nbaGames.push(nbaGame);
                                        whilstCallback();
                                    }
                                });
                        },
                        function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, nbaGames, nbaTeam);
                            }
                        }
                    );
                },
                // Save the schedule to the team
                function(nbaGames, nbaTeam, callback) {
                    // store the games on the team
                    nbaTeam.schedule = nbaGames;
                    nbaTeam.save(function(err) {
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
