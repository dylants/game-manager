var csv = require("csv"),
    request = require("request"),
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
                shortName: team
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

            request.get(getScheduleUrl(teamName), function(error, response, body) {
                csv().from.string(body, {
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
                    // save the games to the team
                    Team.findOne({
                        shortName: teamName
                    }, function(err, team) {
                        team.schedule = nhlGames;
                        team.save(function() {
                            res.send("done");
                        });
                    });
                })
                // if any errors occur
                .on("error", function(error) {
                    console.log(error.message);
                    res.send(500, error.message);
                });
            });
        });
    });
};
