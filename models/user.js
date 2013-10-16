var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    any: Schema.Types.Mixed
}, {
    strict: false
});

mongoose.model("User", UserSchema);
