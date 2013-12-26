/* global define:true */
define([
    "backbone",
    "underscore",
    "text!/assets/templates/game.html",
    "text!/assets/templates/game-notes.html"
], function(Backbone, _, gameHtml, gameNotesHtml) {
    "use strict";

    return Backbone.View.extend({

        template: _.template(gameHtml),
        templateNotes: _.template(gameNotesHtml),

        events: {
            "click .notes-button": "editNotes",
            "click .update-notes-button": "updateNotes",
            "click .cancel-notes-button": "cancelNotes",
            "click .watched-button": "watchedGame"
        },

        initialize: function(options) {
            this.gameState = options.gameState;
            this.notes = options.notes;
        },

        render: function() {
            this.$el.html(this.template(_.extend({}, this.model, {
                notes: this.notes,
                gameState: this.gameState
            })));
            return this;
        },

        editNotes: function(ev) {
            ev.preventDefault();

            // replace the game information with the notes form
            $(this.el).html(this.templateNotes({
                notes: this.notes
            }));
        },

        updateNotes: function(ev) {
            ev.preventDefault();

            this.notes = $("#note-value").val();
            $("#note-value").val("");

            // replace the notes form with the game information
            this.render();

            Backbone.trigger("game-notes", this.model, this.notes);
        },

        cancelNotes: function(ev) {
            ev.preventDefault();

            $("#note-value").val("");

            // replace the notes form with the game information
            this.render();
        },

        watchedGame: function(ev) {
            var game, availableGameTimeUTC, currentTime;

            ev.preventDefault();

            game = this.model;
            availableGameTimeUTC = (+game.availableGameTimeUTC);
            currentTime = new Date();
            currentTime = currentTime.valueOf();

            // only trigger the event if the game is an available game
            if (currentTime > availableGameTimeUTC) {
                Backbone.trigger("game-marked-as-watched", game);

                // set the game state as archived
                this.gameState = "archived";
                // re-render and move the element to archived
                $(this.render().el).appendTo("#archived-games");
            }
        }
    });
});
