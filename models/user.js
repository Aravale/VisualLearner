var mongoose =require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");


var subtopicSchema=new mongoose.Schema({
	name: String,
	code: String,
	psuedocode: String,
	flowchart: String,
});
var Subtopic=mongoose.model("SubTopic",subtopicSchema)

var topicSchema=new mongoose.Schema({
	title: String,
	subtopics:[subtopicSchema]
});
var Topic=mongoose.model("Topic",topicSchema)

var userSchema=new mongoose.Schema({
	first_name: String,
	last_name: String,
	username: String,
	password: String,
	topics:[topicSchema]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema);
