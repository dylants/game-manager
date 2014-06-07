"use strict";

define([
    "backbone",
    "underscore",
    "jquery",
    "text!../templates/session.html"
], function(Backbone, _, $, sessionHtml) {
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
            var username, password, that;

            ev.preventDefault();

            username = this.$("input[name='username']").val();
            password = this.$("input[name='password']").val();

            that = this;
            $.when(
                this.model.save({
                    username: username,
                    password: password
                })
            ).done(function() {
                that.showGames();
            }).fail(function() {
                that.render();
            });
        },

        showGames: function() {
            Backbone.history.navigate("games", {
                trigger: true
            });
        }
    });
});
