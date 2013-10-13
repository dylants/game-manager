/* global define:true */
define([
    "backbone",
    "underscore",
    "text!/assets/templates/game.html"
], function(Backbone, _, gameHtml) {
    "use strict";

    return Backbone.View.extend({

        className: "game well",

        template: _.template(gameHtml),

        events: {},

        initialize: function() {
            this.model.on("sync", this.render, this);
            this.model.on("destroy", this.remove, this);
        },

        render: function() {
            var game;

            
            game = this.model.toJSON();
            this.$el.html(this.template(game));

            if (game.isGameOver) {
                $(this.el).addClass("game-over");
            }
            if (game.isBlackedOut) {
                $(this.el).addClass("blacked-out");
            } else {
                $(this.el).addClass("not-blacked-out");
            }

            return this;
        }
    });
});
