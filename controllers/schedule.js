var csv = require("csv"),
    request = require("request"),
    NHLGameBuilder = require("../model-builders/nhl-game-builder");

var getScheduleUrl = function(team) {
    return "http://" + team + ".nhl.com/schedule/full.csv";
};

module.exports = function(app) {
    app.namespace("/api", function() {
        app.get("/schedule", function(req, res) {
            var team, nhlGames, nhlGameBuilder;

            // default to blackhawks
            team = req.query.team ? req.query.team : "blackhawks";
            nhlGames = [];
            nhlGameBuilder = new NHLGameBuilder();

            request.get(getScheduleUrl(team), function(error, response, body) {
                csv().from.string(body, {
                    delimiter: ",",
                    escape: '"'
                })
                // when a record is found in the CSV file (a row)
                .on("record", function(row, index) {
                    var nhlGame, teams;

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
                    nhlGames.push(nhlGame);

                })
                // when the end of the CSV document is reached
                .on("end", function() {
                    res.send(nhlGames);
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
