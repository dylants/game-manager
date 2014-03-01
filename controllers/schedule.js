var csv = require("csv"),
    request = require("request"),
    async = require("async"),
    NHLGameBuilder = require("../lib/nhl-game-builder"),
    NBAGameBuilder = require("../lib/nba-game-builder"),
    teamSchedule = require("../lib/team-schedule"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

function getNHLScheduleUrl(team) {
    return "http://" + team + ".nhl.com/schedule/full.csv";
}

function getNBAScheduleUrl(team) {
    return "http://www.nba.com/" + team + "/schedule/2013/schedule.csv";
}

function getTeamSchedule(sport, teamName, res) {
    Team.findOne({
        sport: sport,
        name: teamName
    }).populate("schedule").exec(function(err, team) {
        if (err) {
            console.error(err);
            res.send(500);
            return;
        }

        if (team) {
            res.send(team.schedule);
        } else {
            res.send(404, "Team not found");
        }
    });
}

function updateSchedule(sport, teamName, rowHeaderIndexes, app, res) {
    var gameBuilder, scheduleUrl;

    if (sport === "NHL") {
        gameBuilder = new NHLGameBuilder();
        scheduleUrl = getNHLScheduleUrl(teamName);
    } else if (sport === "NBA") {
        gameBuilder = new NBAGameBuilder();
        scheduleUrl = getNBAScheduleUrl(teamName);
    } else {
        console.error("Unrecognized sport: " + sport);
        res.send(500);
        return;
    }

    teamSchedule.update(scheduleUrl, sport, teamName, rowHeaderIndexes,
        gameBuilder, app,
        function(err) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }

            res.send("done!");
        }
    );
}

module.exports = function(app) {
    app.namespace("/api", function() {

        /***********
         *** NHL ***
         ***********/

        app.get("/nhl/teams/:team/schedule", function(req, res) {
            getTeamSchedule("NHL", req.params.team, res);
        });

        app.get("/nhl/teams/:team/update-schedule", function(req, res) {
            updateSchedule("NHL", req.params.team, {
                date: 0,
                time: 1,
                teams: 3,
                location: 4,
                description: 5
            }, app, res);
        });

        /***********
         *** NBA ***
         ***********/

        app.get("/nba/teams/:team/schedule", function(req, res) {
            getTeamSchedule("NBA", req.params.team, res);
        });

        app.get("/nba/teams/:team/update-schedule", function(req, res) {
            updateSchedule("NBA", req.params.team, {
                date: 1,
                time: 2,
                teams: 0,
                location: 3,
                description: 4
            }, app, res);
        });
    });
};
