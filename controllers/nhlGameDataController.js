module.exports = function(app) {
    app.get("/", function(req, res) {
        // redirect to nhl-game-data
        res.redirect("/nhl-game-data");
    });
    app.get("/nhl-game-data*", function(req, res) {
        res.render("nhl-game-data");
    });
};
