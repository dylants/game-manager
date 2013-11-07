/*global define:true */
define([
    "backbone",
    "jquery",
    "session-model",
    "session-view",
    "schedule-collection",
    "schedule-view"
], function(Backbone, $, SessionModel, SessionView, ScheduleCollection, ScheduleView) {
    "use strict";

    var sessionModel, sessionView, scheduleCollection, scheduleView;

    var Router = Backbone.Router.extend({
        routes: {
            "": "landing",
            "login": "login",
            "nhl/schedule": "nhlSchedule",
            "*invalidRoute": "badRoute"
        },

        initialize: function() {
            this.on("route", this.routeCalled, this);
        },

        routeCalled: function() {
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

            sessionModel = new SessionModel();
            sessionView = new SessionView({
                model: sessionModel
            });
            sessionView.render();
        },

        nhlSchedule: function(queryParams) {
            if (scheduleView) {
                scheduleView.close();
            }

            sessionModel = new SessionModel();
            scheduleCollection = new ScheduleCollection([], queryParams);
            scheduleView = new ScheduleView({
                collection: scheduleCollection,
                userData: sessionModel
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
