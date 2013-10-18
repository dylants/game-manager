module.exports = function(app) {
    app.get("/", function(req, res) {
        res.redirect("/game-manager");
    });
    app.get("/game-manager*", function(req, res) {
        res.render("game-manager");
    });
};
