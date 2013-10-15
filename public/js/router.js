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
            "schedule": "schedule",
            "*invalidRoute": "badRoute"
        },

        landing: function() {
            this.navigate("schedule", {
                trigger: true
            });
        },

        schedule: function(queryParams) {
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
