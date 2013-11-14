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
            "click .notes-button": "editNotes",
            "click .watched-button": "watchedGame"
        },

        initialize: function(args) {
            this.userModel = args.userModel;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        editNotes: function(ev) {
            ev.preventDefault();

            console.log("edit notes!");
        },

        watchedGame: function(ev) {
            var sportsWatched, i, nhlGamesWatched, gameTimeUTC, availableGameTimeUTC,
                currentTime;

            ev.preventDefault();

            sportsWatched = this.userModel.get("sportsWatched");

            for (i = 0; i < sportsWatched.length; i++) {
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

            gameTimeUTC = (+this.model.get("gameTimeUTC"));
            availableGameTimeUTC = (+this.model.get("availableGameTimeUTC"));
            currentTime = new Date();
            currentTime = currentTime.valueOf();
            // only add the game if it's not already there && it is available
            if ((nhlGamesWatched.indexOf(gameTimeUTC) === -1) &&
                (currentTime > availableGameTimeUTC)) {
                nhlGamesWatched.push(gameTimeUTC);
                this.userModel.save();
            }
        }
    });
});
