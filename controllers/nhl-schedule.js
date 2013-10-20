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

        app.get("/schedule/:team", function(req, res) {
            var team;

            team = req.params.team;

            Team.findOne({
                name: team
            }, function(err, team) {
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

        app.get("/import-schedule/:team", function(req, res) {
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
                    var nhlGames = [];

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

                        // date, time, teams, location, networks
                        nhlGame = nhlGameBuilder.buildNHLGame(
                            row[0].trim(),
                            row[1].trim(),
                            row[3].trim(),
                            row[4].trim(),
                            row[5].trim());
                        // add the game to our list
                        nhlGames.push(nhlGame);
                    })
                    // when the end of the CSV document is reached
                    .on("end", function() {
                        // call the next function with the games
                        callback(null, nhlGames, nhlTeam);
                    })
                    // if any errors occur
                    .on("error", function(error) {
                        // call the callback with the error message
                        callback(error.message);
                    });
                },
                // Save the schedule to the team
                function(nhlGames, nhlTeam, callback) {
                    // save the games to the team
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
