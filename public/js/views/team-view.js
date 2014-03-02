/* global define:true */
define([
    "backbone",
    "underscore",
    "text!../templates/team.html"
], function(Backbone, _, teamHtml) {
    "use strict";

    return Backbone.View.extend({

        tagName: "span",

        template: _.template(teamHtml),

        events: {
            "click .team": "teamSelected"
        },

        initialize: function() {},

        render: function() {
            this.$el.html(this.template(this.model));
            return this;
        },

        teamSelected: function(ev) {
            ev.preventDefault();

            $(ev.currentTarget).toggleClass("team-selected");
        }
    });
});
