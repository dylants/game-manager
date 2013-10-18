/* global define:true */
define([
    "backbone",
    "underscore",
    "text!/assets/templates/game.html"
], function(Backbone, _, gameHtml) {
    "use strict";

    return Backbone.View.extend({

        template: _.template(gameHtml),

        events: {},

        initialize: function() {
            this.model.on("sync", this.render, this);
            this.model.on("destroy", this.remove, this);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });
});
