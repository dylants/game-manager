/* global define:true */
define([
    "backbone",
    "underscore",
    "text!/assets/templates/session.html"
], function(Backbone, _, sessionHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "#main",

        template: _.template(sessionHtml),

        events: {
            "click #login": "login"
        },

        initialize: function() {
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        login: function(ev) {
            var username;

            ev.preventDefault();

            username = this.$("input[name='username']").val();

            this.model.save({
                username: username
            }, {
                success: this.showLanding,
                error: this.render
            });
        },

        showLanding: function() {
            Backbone.history.navigate("nhl/schedule", {
                trigger: true
            });
        }
    });
});
