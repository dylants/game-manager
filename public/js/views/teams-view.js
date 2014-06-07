"use strict";

define([
    "backbone",
    "underscore",
    "jquery",
    "team-view",
    "text!../templates/teams.html"
], function(Backbone, _, $, TeamView, teamsHtml) {
    return Backbone.View.extend({

        el: "#main",

        template: _.template(teamsHtml),

        events: {},

        initialize: function(args) {
            this.userModel = args.userModel;

            // keep track of child views
            this.childViews = [];

            // setup for team adding/deleting
            Backbone.on("team-added", this.teamAdded, this);
            Backbone.on("team-removed", this.teamRemoved, this);
        },

        close: function() {
            var i;

            // close all child views
            for (i = 0; i < this.childViews.length; i++) {
                this.childViews[i].close();
            }

            // stop listening to the events
            Backbone.off("team-added");
            Backbone.off("team-removed");

            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var view;

            this.$el.html(this.template());

            view = this;
            // fetch all the teams and user data
            $.when(
                this.model.fetch(),
                this.userModel.fetch()
            ).done(function() {
                view.renderSports();
            });

            return this;
        },

        renderSports: function() {
            this.renderTeams($("#nhl-teams"), this.model.get("NHL"));
            this.renderTeams($("#nba-teams"), this.model.get("NBA"));
            this.renderTeams($("#mlb-teams"), this.model.get("MLB"));
        },

        renderTeams: function(selector, teams) {
            var view;

            // clear the existing teams content
            selector.empty();

            view = this;
            // render the teams
            teams.forEach(function(team) {
                var teamView;

                teamView = new TeamView({
                    model: team,
                    teamSelected: view.isTeamSelected(team)
                });
                selector.append(teamView.render().el);

                // add this view to our list of child views
                view.childViews.push(teamView);
            });
        },

        isTeamSelected: function(team) {
            var teams, i;

            teams = this.userModel.toJSON().teams;

            for (i = 0; i < teams.length; i++) {
                if ((team.sport === teams[i].sport) && (team.name === teams[i].team)) {
                    return true;
                }
            }
            return false;
        },

        teamAdded: function(sport, name) {
            var teams;

            teams = this.userModel.toJSON().teams;
            teams.push({
                sport: sport,
                team: name
            });
            this.updateTeams(teams);
        },

        teamRemoved: function(sport, name) {
            var currentTeams, updatedTeams, i;

            currentTeams = this.userModel.toJSON().teams;
            updatedTeams = [];

            for (i = 0; i < currentTeams.length; i++) {
                if ((sport === currentTeams[i].sport) && (name === currentTeams[i].team)) {
                    // skip this team
                } else {
                    updatedTeams.push(currentTeams[i]);
                }
            }
            this.updateTeams(updatedTeams);
        },

        updateTeams: function(teams) {
            this.userModel.save({
                teams: teams
            }, {
                patch: true
            });
        }
    });

});
