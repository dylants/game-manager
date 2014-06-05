/*global define:true */
define([
    "backbone",
    "jquery",
    "session-model",
    "session-view",
    "user-ui-data-model",
    "games-view",
    "teams-ui-model",
    "teams-view",
    "header-view"
], function(Backbone, $, SessionModel, SessionView, UserUiDataModel, GamesView,
    TeamsUIModel, TeamsView, HeaderView) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes: {
            "": "gameManager",
            "login": "login",
            "games": "games",
            "teams": "teams",
            "*invalidRoute": "badRoute"
        },

        initialize: function() {
            this.on("route", this.routeCalled, this);

            this.currentView = null;
            this.sessionModel = null;

            this.renderHeader();
        },

        before: function(route, params) {
            var router;

            if (!this.sessionModel) {
                this.sessionModel = new SessionModel();
            }

            // allow these routes to go through without any problems
            if (route === "" || route === "login") {
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
                this.sessionModel.fetch()
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

        gameManager: function() {
            // because of our security management in the before
            // filter, here we'll redirect to /games directly rather
            // than sending "" to "games" (which in the end, does
            // not setup the URL correctly)
            Backbone.history.navigate("games", {
                trigger: true
            });
        },

        login: function() {
            if (this.currentView) {
                this.currentView.close();
            }

            this.currentView = new SessionView({
                model: this.sessionModel
            });
            this.currentView.render();
        },

        games: function() {
            var userModel;

            if (this.currentView) {
                this.currentView.close();
            }

            userModel = new UserUiDataModel();
            this.currentView = new GamesView({
                model: userModel
            });
            this.currentView.render();
        },

        teams: function() {
            var teamsModel, userModel;

            if (this.currentView) {
                this.currentView.close();
            }

            teamsModel = new TeamsUIModel();
            userModel = new UserUiDataModel();
            this.currentView = new TeamsView({
                model: teamsModel,
                userModel: userModel
            });
            this.currentView.render();
        },

        renderHeader: function() {
            var headerView;

            headerView = new HeaderView();
            headerView.render();
        },

        badRoute: function(invalidRoute) {
            console.error("bad route: " + invalidRoute);
            console.error("redirecting to /");
            location.href = "/";
        }
    });

    return Router;

});
