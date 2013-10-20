var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var TeamSchema = new Schema({
    name: {
        type: String
    },
    city: {
        type: String
    },
    mascot: {
        type: String
    },
    sport: {
        type: String
    },
    conference: {
        type: String
    },
    division: {
        type: String
    },
    schedule: {
        type: Array
    },
    record: {
        type: String
    }
});

mongoose.model("Team", TeamSchema);
