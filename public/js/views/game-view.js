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
            var gameWatched;

            console.log("clicked!");
            console.log(this.model.toJSON());
            gameWatched = {
                sport: "nhl",
                gameTimeUTC: this.model.get("gameTimeUTC")
            };
            this.userModel.save({
                gameWatched: gameWatched
            });
        }
    });
});
