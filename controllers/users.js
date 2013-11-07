var mongoose = require("mongoose"),
    User = mongoose.model("User");

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/users", function(req, res) {
            User.find(function(err, users) {
                res.send(users);
            });

        });

        app.get("/users/:user", function(req, res) {
            User.findOne({
                username: req.params.user
            }, function(err, user) {
                res.send(user);
            });
        });

    });
};
