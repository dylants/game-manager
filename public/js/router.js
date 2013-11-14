/*global define:true */
define([
    "backbone",
    "jquery",
    "session-model",
    "session-view",
    "user-model",
    "games-view"
], function(Backbone, $, SessionModel, SessionView, UserModel, GamesView) {
    "use strict";

    var sessionModel, sessionView, userModel, gamesView;

    var Router = Backbone.Router.extend({
        routes: {
            "": "games",
            "login": "login",
            "games": "games",
            "*invalidRoute": "badRoute"
        },

        initialize: function() {
            this.on("route", this.routeCalled, this);
        },

        before: function(route, params) {
            var that;

            if (!sessionModel) {
                sessionModel = new SessionModel();
            }

            if (route === "login") {
                // allow those to go through without any problems
                return true;
            }

            that = this;
            $.when(
                sessionModel.fetch()
            ).done(
                function() {
                    // TODO Really need to fix this...
                    that.games();
                    // Backbone.history.navigate(route, {
                    //     trigger: true
                    // });
                }
            ).fail(
                function() {
                    Backbone.history.navigate("login", {
                        trigger: true
                    });
                }
            );
            return false;
        },

        routeCalled: function(routeCalled, args) {
            // scroll to the top of the window on every route call
            window.scrollTo(0, 0);
        },

        login: function() {
            if (sessionView) {
                sessionView.close();
            }

            sessionView = new SessionView({
                model: sessionModel
            });
            sessionView.render();
        },

        games: function(queryParams) {
            if (gamesView) {
                gamesView.close();
            }

            userModel = new UserModel([], sessionModel.get("_id"));
            gamesView = new GamesView({
                model: userModel
            });
            gamesView.render();
        },

        badRoute: function(invalidRoute) {
            console.error("bad route: " + invalidRoute);
            console.error("redirecting to /");
            location.href = "/";
        }
    });

    return Router;

});
