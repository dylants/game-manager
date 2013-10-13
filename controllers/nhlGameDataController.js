module.exports = function(app) {
    app.get("/nhl-game-data*", function(req, res) {
        res.render("nhl-game-data");
    });
};
