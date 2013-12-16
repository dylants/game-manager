var passport = require("passport"),
    mongoose = require("mongoose"),
    User = mongoose.model("User");

module.exports = function(app) {
    // returns the user if authenticated, else 401 (unauthorized)
    app.get("/session", function(req, res) {
        if (req.isAuthenticated()) {
            res.send(req.user);
        } else {
            res.send(401);
        }
    });

    // logs a user in via passport
    app.post("/session", function(req, res, next) {
        // calls passport's local strategy to authenticate
        passport.authenticate("local", function(err, user, info) {
            // if any problems exist, error out
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send(500, info.message);
            }

            // log in the user
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                // once login succeeded, return the user and session created 201
                return res.send(201, user);
            });
        })(req, res, next);
    });

    app.delete("/session", function(req, res) {
        req.logout();
        res.send(200);
    });
};
