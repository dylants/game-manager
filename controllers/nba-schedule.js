var csv = require("csv"),
    request = require("request"),
    async = require("async"),
    NBAGameBuilder = require("../lib/nba-game-builder"),
    teamSchedule = require("../lib/team-schedule"),
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
            var teamName, nbaGameBuilder;

            teamName = req.params.team;
            nbaGameBuilder = new NBAGameBuilder();

            teamSchedule.update(getScheduleUrl(teamName), "NBA", teamName, {
                    date: 1,
                    time: 2,
                    teams: 0,
                    location: 3,
                    description: 4
                }, nbaGameBuilder, app,
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
