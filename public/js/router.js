/*global define:true */
define([
    "backbone",
    "jquery",
    "game-collection",
    "games-view"
], function(Backbone, $, GameCollection, GamesView) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes: {
            "": "landing",
            "schedule": "schedule",
            "*otherRoute": "badRoute"
        },

        landing: function() {
            this.navigate("schedule", {
                trigger: true
            });
        },

        schedule: function() {
            var gameCollection, gamesView;

            if (gamesView) {
                gamesView.close();
            }

            gameCollection = new GameCollection();
            gamesView = new GamesView({
                collection: gameCollection
            });
            gamesView.render();
        },

        badRoute: function(otherRoute) {
            console.error("bad route: " + otherRoute);
        }
    });

    return Router;

});
