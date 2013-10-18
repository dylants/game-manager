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
                shortName: req.params.team
            }, function(err, team) {
                res.send(team);
            });
        });

        app.get("/import-teams", function(req, res) {
            var team;

            // TODO import teams from somewhere?
            team = new Team({
                fullName: "Chicago Blackhawks",
                shortName: "blackhawks",
                sport: "NHL"
            });
            team.save();
            res.send("done!");
        });

    });
};
