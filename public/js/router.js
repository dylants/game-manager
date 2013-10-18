/*global define:true */
define([
    "backbone",
    "jquery",
    "schedule-collection",
    "schedule-view"
], function(Backbone, $, ScheduleCollection, ScheduleView) {
    "use strict";

    var scheduleCollection, scheduleView;

    var Router = Backbone.Router.extend({
        routes: {
            "": "landing",
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

        nhlSchedule: function(queryParams) {
            if (scheduleView) {
                scheduleView.close();
            }

            scheduleCollection = new ScheduleCollection([], queryParams);
            scheduleView = new ScheduleView({
                collection: scheduleCollection
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
