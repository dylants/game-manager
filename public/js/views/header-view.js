/* global define:true */
define([
    "backbone",
    "underscore",
    "text!../templates/header.html"
], function(Backbone, _, headerHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "header",

        template: _.template(headerHtml),

        events: {},

        initialize: function() {},

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        }
    });
});
