var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var TeamSchema = new Schema({
    fullName: {
        type: String
    },
    shortName: {
        type: String
    },
    sport: {
        type: String
    },
    schedule: {
        type: Array
    }
});

mongoose.model("Team", TeamSchema);
