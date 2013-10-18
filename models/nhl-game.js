var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var NHLGameSchema = new Schema({
    any: Schema.Types.Mixed
}, {
    strict: false
});

mongoose.model("NHLGame", NHLGameSchema);
