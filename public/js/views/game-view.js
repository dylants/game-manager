/* global define:true */
define([
    "backbone",
    "underscore",
    "user-model",
    "text!/assets/templates/game.html"
], function(Backbone, _, UserModel, gameHtml) {
    "use strict";

    return Backbone.View.extend({

        template: _.template(gameHtml),

        events: {
            "click .game": "watchedGame"
        },

        initialize: function(args) {
            this.userModel = args.userModel;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        watchedGame: function(ev) {
            var sportsWatched, i, nhlGamesWatched;

            sportsWatched = this.userModel.get("sportsWatched");

            for (i=0; i<sportsWatched.length; i++) {
                if (sportsWatched[i].sport === "NHL") {
                    nhlGamesWatched = sportsWatched[i].gamesWatched;
                    break;
                }
            }
            if (!nhlGamesWatched) {
                sportsWatched.push({
                    sport: "NHL",
                    gamesWatched: []
                });
                nhlGamesWatched = sportsWatched[sportsWatched.length - 1].gamesWatched;
            }

            nhlGamesWatched.push({
                gameTimeUTC: this.model.get("gameTimeUTC")
            });
            this.userModel.save();
        }
    });
});
