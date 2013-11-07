/* global define:true */
define([
    "backbone"
], function(Backbone) {
    "use strict";

    return Backbone.Model.extend({
        url: function() {
            return "/api/users/" + this.id;
        },

        idAttribute: "_id",

        initialize: function(models, userId) {
            this.id = userId;
        },

        parse: function(resp, options) {
            /*
             * For some reason (and it may just be my misunderstanding), the combination
             * of Backbone and Mongo results in an error on PUT requests, because Backbone
             * sends the _id and Mongo does not like that. So one way around this is to
             * remove the _id attribute before we get it, so we never send it in future
             * requests. Override the parse function here to do just that.
             */
            delete resp._id;
            return resp;
        }
    });
});
