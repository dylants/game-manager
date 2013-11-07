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

        initialize: function() {},

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
            var username, that;

            ev.preventDefault();

            username = this.$("input[name='username']").val();

            that = this;
            $.when(
                this.model.save({
                    username: username
                })
            ).done(function() {
                that.showLanding();
            }).fail(function() {
                that.render();
            });
        },

        showLanding: function() {
            Backbone.history.navigate("nhl/schedule", {
                trigger: true
            });
        }
    });
});
