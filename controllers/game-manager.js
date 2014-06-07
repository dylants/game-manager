"use strict";

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.redirect("/game-manager");
    });
    app.get("/game-manager*", function(req, res) {
        if (app.get("env") == "production") {
            res.render("game-manager-production.html");
        } else {
            res.render("game-manager-development.html");
        }
    });
};
