"use strict";

define([
    "backbone",
    "underscore",
    "jquery",
    "text!../templates/team.html"
], function(Backbone, _, $, teamHtml) {
    return Backbone.View.extend({

        tagName: "span",

        template: _.template(teamHtml),

        events: {
            "click .team": "teamSelectionChanged"
        },

        initialize: function(options) {
            this.teamSelected = options.teamSelected;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template(_.extend({}, this.model, {
                teamSelected: this.teamSelected
            })));
            return this;
        },

        teamSelectionChanged: function(ev) {
            ev.preventDefault();

            $(ev.currentTarget).toggleClass("team-selected");

            if (this.teamSelected) {
                Backbone.trigger("team-removed", this.model.sport, this.model.name);
                this.teamSelected = false;
            } else {
                Backbone.trigger("team-added", this.model.sport, this.model.name);
                this.teamSelected = true;
            }
        }
    });
});
