var mongoose = require("mongoose"),
    Team = mongoose.model("Team");

module.exports = function(app) {
    app.namespace("/api/nhl", function() {

        app.get("/teams", function(req, res) {
            Team.find(function(err, teams) {
                var nhlTeams, team;

                nhlTeams = [];
                for (count = 0; count < teams.length; count++) {
                    team = teams[count].toJSON();
                    // remove the schedule
                    delete team.schedule;
                    nhlTeams.push(team);
                }
                res.send(nhlTeams);
            });

        });

        app.get("/teams/:team", function(req, res) {
            Team.findOne({
                name: req.params.team
            }, function(err, team) {
                res.send(team);
            });
        });

        app.get("/import-teams", function(req, res) {
            var teams, team, i;

            teams = app.get("config").nhl.teams;
            for (i = 0; i < teams.length; i++) {
                team = new Team({
                    // name is the lowercase, trimmed mascot
                    name: teams[i].mascot.toLowerCase().replace(/\s*/g, ""),
                    city: teams[i].city,
                    mascot: teams[i].mascot,
                    sport: "NHL",
                    conference: teams[i].conference,
                    division: teams[i].division
                });
                team.save();
            }
            res.send("done!");
        });

    });
};
