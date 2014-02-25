/*global define:true */
define([
    "backbone",
    "jquery",
    "session-model",
    "session-view",
    "user-ui-data-model",
    "games-view"
], function(Backbone, $, SessionModel, SessionView, UserUiDataModel, GamesView) {
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
            var router;

            if (!sessionModel) {
                sessionModel = new SessionModel();
            }

            if (route === "login") {
                // allow those to go through without any problems
                return true;
            }

            router = this;
            // Here we're going to perform a GET request for the session,
            // and if it's found, we'll navigate to the specified route.
            // If it's not found, we navigate to the login page to allow
            // the user to authenticate themselves. In this way, we've
            // (at least through this code path) verified the user is
            // logged in prior to viewing each page.
            $.when(
                sessionModel.fetch()
            ).done(
                function() {
                    // Call the original function
                    // Do this by looking up the function to be called from the
                    // routes object (defined above), and calling that function
                    // from our router (which is the original "this" instance)
                    router[router.routes[route]].apply(router, params);
                }
            ).fail(
                function() {
                    // in a fail case, navigate back to login
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

            userModel = new UserUiDataModel([], sessionModel.get("_id"));
            gamesView = new GamesView({
                model: userModel
            });
            // First, load the model. Then when done, call render
            $.when(
                userModel.fetch()
            ).done(
                function() {
                    gamesView.render();
                }
            );
        },

        badRoute: function(invalidRoute) {
            console.error("bad route: " + invalidRoute);
            console.error("redirecting to /");
            location.href = "/";
        }
    });

    return Router;

});
