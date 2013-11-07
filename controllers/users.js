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
            console.log("id: " + req.params.id);
            User.findById(req.params.id, function(err, user) {
                var gameWatched;

                gameWatched = req.body.gameWatched;
                console.log("gameWatched: " + JSON.stringify(gameWatched));
                user.gamesWatched.push(gameWatched);
                console.log("user: " + user);
                user.save(function(err, user) {
                    res.send(user);
                });
            });
        });

    });
};
