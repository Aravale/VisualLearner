var mongoose =require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var shapeSchema=new mongoose.Schema({
	className: String,
	x: Number,
	y: Number,
	points:[Number],
	shapeText: String
});
var Shape=mongoose.model("Shape",shapeSchema)

var subtopicSchema=new mongoose.Schema({
	name: String,
	code: [String],
	psuedocode: [String],
	flowchart: {shapes:[shapeSchema],
				StageH:Number,
				}
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
