/*global define:true */
define([
    "backbone",
    "jquery",
    "session-model",
    "session-view",
    "user-model",
    "schedule-collection",
    "schedule-view"
], function(Backbone, $, SessionModel, SessionView, UserModel, ScheduleCollection,
    ScheduleView) {
    "use strict";

    var sessionModel, sessionView, userModel, scheduleCollection, scheduleView;

    var Router = Backbone.Router.extend({
        routes: {
            "": "validateSession",
            "login": "login",
            "nhl/schedule": "nhlSchedule",
            "*invalidRoute": "badRoute"
        },

        initialize: function() {
            this.on("route", this.routeCalled, this);
        },

        before: function(route, params) {
            if (!sessionModel) {
                sessionModel = new SessionModel();
            }
            var that = this;
            $.when(
                sessionModel.fetch()
            ).done(
                function() {
                    // TODO Really need to fix this...
                    that.nhlSchedule();
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

        landing: function() {
            // by default, send them to the NHL schedule page
            this.navigate("nhl/schedule", {
                trigger: true
            });
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

        nhlSchedule: function(queryParams) {
            if (scheduleView) {
                scheduleView.close();
            }

            userModel = new UserModel([], sessionModel.get("_id"));
            scheduleCollection = new ScheduleCollection([], queryParams);
            scheduleView = new ScheduleView({
                collection: scheduleCollection,
                userModel: userModel
            });
            scheduleView.render();
        },

        badRoute: function(invalidRoute) {
            console.error("bad route: " + invalidRoute);
            console.error("redirecting to /");
            location.href = "/";
        }
    });

    return Router;

});
