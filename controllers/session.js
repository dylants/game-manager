var mongoose = require("mongoose"),
    User = mongoose.model("User");

var SESSION_COOKIE = "session_cookie";

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/session", function(req, res) {
            var sessionId = req.cookies[SESSION_COOKIE];

            if (sessionId) {
                res.send(sessionId);
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
                username: username
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
                    res.send(201);
                } else {
                    console.log("user does not exist, creating...");
                    // the user does not exist, create it
                    user = new User({
                        username: username
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
                        res.send(201);
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
