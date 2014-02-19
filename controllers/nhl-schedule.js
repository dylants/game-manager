var csv = require("csv"),
    request = require("request"),
    async = require("async"),
    NHLGameBuilder = require("../lib/nhl-game-builder"),
    teamSchedule = require("../lib/team-schedule"),
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
            var teamName, nhlGameBuilder;

            teamName = req.params.team;
            nhlGameBuilder = new NHLGameBuilder();

            teamSchedule.update(getScheduleUrl(teamName), "NHL", teamName, {
                    date: 0,
                    time: 1,
                    teams: 3,
                    location: 4,
                    description: 5
                }, nhlGameBuilder, app,
                function(err) {
                    if (err) {
                        console.log(err);
                        res.send(500, err);
                        return;
                    }

                    res.send("done!");
                }
            );
        });
    });
};
