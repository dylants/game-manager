var mongoose = require("mongoose"),
    User = mongoose.model("User");

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/users", function(req, res) {
            User.find(function(err, users) {
                res.send(users);
            });

        });

        app.get("/users/:id", function(req, res) {
            User.findById(req.params.id, function(err, user) {
                res.send(user);
            });
        });

        app.put("/users/:id", function(req, res) {
            User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
                // if there is an error, handle it and return
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }

                // with no errors, respond with the updated user (if it exists)
                if (user === null) {
                    res.send(404);
                } else {
                    res.send(user);
                }
            });
        });

    });
};
