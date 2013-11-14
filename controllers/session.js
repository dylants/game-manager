var mongoose = require("mongoose"),
    User = mongoose.model("User");

var SESSION_COOKIE = "session_cookie";

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/session", function(req, res) {
            var sessionId = req.cookies[SESSION_COOKIE];

            if (sessionId) {
                // verify it's a valid user
                User.findById(sessionId, function(err, user) {
                    if (user) {
                        res.send(user);
                    } else {
                        res.send(404);
                    }
                });
            } else {
                res.send(404);
            }
        });

        app.post("/session", function(req, res) {
            var username;

            // they should post the user name, try to find if it already exists
            username = req.body.username;
            if (!username) {
                res.send(400);
                return;
            }

            User.findOne({
                username: new RegExp(username, "i")
            }, function(err, user) {
                if (err) {
                    console.error(err);
                    res.send(500, err);
                    return;
                }

                if (user) {
                    // the user already exists, just "log us in"
                    console.log("user already exists, logging in user");

                    res.cookie(SESSION_COOKIE, user.id);
                    res.send(201, user);
                } else {
                    console.log("user does not exist, creating...");
                    // the user does not exist, create it

                    // TODO allow user to specify the teams, but until then
                    // default the user to following the blackhawks and bulls
                    var teams = [];
                    teams.push({
                        sport: "NHL",
                        team: "blackhawks"
                    });
                    teams.push({
                        sport: "NBA",
                        team: "bulls"
                    });
                    user = new User({
                        username: username,
                        teams: teams
                    });
                    user.save(function(err, user) {
                        if (err) {
                            console.error(err);
                            res.send(500, err);
                            return;
                        }
                        console.log("created user");
                        // use this user as the session cookie
                        res.cookie(SESSION_COOKIE, user.id);
                        res.send(201, user);
                    });
                }
            });
        });

        app.delete("/session", function(req, res) {
            // deleting the session means deleting the cookie
            res.clearCookie(SESSION_COOKIE);
            res.send(200);
        });

    });
};
