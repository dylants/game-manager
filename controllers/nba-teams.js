var mongoose = require("mongoose"),
    Team = mongoose.model("Team");

module.exports = function(app) {
    app.namespace("/api/nba", function() {

        app.get("/teams", function(req, res) {
            Team.find({
                sport: "NBA"
            }, function(err, teams) {
                var nbaTeams, team;

                nbaTeams = [];
                for (count = 0; count < teams.length; count++) {
                    team = teams[count].toJSON();
                    // remove the schedule
                    delete team.schedule;
                    nbaTeams.push(team);
                }
                res.send(nbaTeams);
            });

        });

        app.get("/teams/:team", function(req, res) {
            Team.findOne({
                sport: "NBA",
                name: req.params.team
            }, function(err, team) {
                res.send(team);
            });
        });

        app.get("/import-teams", function(req, res) {
            var teams, team, i;

            teams = app.get("config").nba.teams;
            for (i = 0; i < teams.length; i++) {
                team = new Team({
                    // name is the lowercase, trimmed mascot
                    name: teams[i].mascot.toLowerCase().replace(/\s*/g, ""),
                    city: teams[i].city,
                    mascot: teams[i].mascot,
                    sport: "NBA",
                    conference: teams[i].conference,
                    division: teams[i].division,
                    logoHref: teams[i].logoHref
                });
                team.save();
            }
            res.send("done!");
        });

    });
};
