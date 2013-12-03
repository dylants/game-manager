/* global define:true */
define([
    "backbone",
    "underscore",
    "text!/assets/templates/game.html"
], function(Backbone, _, gameHtml) {
    "use strict";

    return Backbone.View.extend({

        template: _.template(gameHtml),

        events: {
            "click .notes-button": "editNotes",
            "click .watched-button": "watchedGame"
        },

        initialize: function() {},

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        editNotes: function(ev) {
            ev.preventDefault();

            Backbone.trigger("game-edit", this.model.toJSON());
        },

        watchedGame: function(ev) {
            var game, availableGameTimeUTC, currentTime;

            ev.preventDefault();

            game = this.model.toJSON();
            availableGameTimeUTC = (+game.availableGameTimeUTC);
            currentTime = new Date();
            currentTime = currentTime.valueOf();

            // only trigger the event if the game is an available game
            if (currentTime > availableGameTimeUTC) {
                Backbone.trigger("game-marked-as-watched", game);
            }
        }
    });
});
