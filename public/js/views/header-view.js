/* global define:true */
define([
    "backbone",
    "underscore",
    "text!../templates/header.html"
], function(Backbone, _, headerHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "header",

        template: _.template(headerHtml),

        events: {
            "click #game-manager-link": "navToGameManager",
            "click #games-link": "navToGames",
            "click #teams-link": "navToTeams"
        },

        initialize: function() {},

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        navToGameManager: function(ev) {
            ev.preventDefault();

            Backbone.history.navigate("", {
                trigger: true
            });
        },

        navToGames: function(ev) {
            ev.preventDefault();

            // toggle the navbar if necessary
            if (!$(".navbar-header button").is(":hidden")) {
                $(".collapse").collapse("toggle");
            }

            Backbone.history.navigate("games", {
                trigger: true
            });
        },

        navToTeams: function(ev) {
            ev.preventDefault();

            // toggle the navbar if necessary
            if (!$(".navbar-header button").is(":hidden")) {
                $(".collapse").collapse("toggle");
            }

            Backbone.history.navigate("teams", {
                trigger: true
            });
        }
    });
});
