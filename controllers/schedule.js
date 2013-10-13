var csv = require("csv"),
    request = require("request"),
    Game = require("../models/game");

var getScheduleUrl = function(team) {
    return "http://" + team + ".nhl.com/schedule/full.csv";
};

module.exports = function(app) {
    app.namespace("/api", function() {
        app.get("/schedule", function(req, res) {
            var team, games;

            // default to blackhawks
            team = req.query.team ? req.query.team : "blackhawks";
            games = [];

            request.get(getScheduleUrl(team), function(error, response, body) {
                csv().from.string(body, {
                    delimiter: ",",
                    escape: '"'
                })
                // when a record is found in the CSV file (a row)
                .on("record", function(row, index) {
                    var game, teams;

                    // skip the header row
                    if (index === 0) {
                        return;
                    }

                    // date, time, teams, location, networks
                    game = new Game(row[0].trim(),
                        row[1].trim(),
                        row[3].trim(),
                        row[4].trim(),
                        row[5].trim());
                    games.push(game);

                })
                // when the end of the CSV document is reached
                .on("end", function() {
                    res.send(games);
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
