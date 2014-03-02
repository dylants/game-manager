/* global define:true */
define([
    "backbone",
    "underscore",
    "jquery",
    "team-view",
    "text!../templates/teams.html"
], function(Backbone, _, $, TeamView, teamsHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "#main",

        template: _.template(teamsHtml),

        events: {},

        initialize: function(args) {
            this.model.on("sync", this.renderSports, this);
        },

        render: function() {
            this.$el.html(this.template());

            // fetch all the teams
            this.model.fetch();

            return this;
        },

        renderSports: function() {
            this.renderTeams($("#nhl-teams"), this.model.get("NHL"));
            this.renderTeams($("#nba-teams"), this.model.get("NBA"));
        },

        renderTeams: function(selector, teams) {
            // clear the existing teams content
            selector.empty();

            // render the teams
            teams.forEach(function(team) {
                var teamView;

                teamView = new TeamView({
                    model: team
                });
                selector.append(teamView.render().el);
            });
        }
    });

});
