var mongoose =require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var shapeSchema=new mongoose.Schema({
	SName: String,
	AName: [String,String],
	x: Number,
	y: Number,
	points:[Number],
	shapeText: String,
	shapeW: Number,
	stroke:String,
	anchors:[[String,String]]
});
//var Shape=mongoose.model("Shape",shapeSchema)

var subtopicSchema=new mongoose.Schema({
	name: String,
	description:String,
	code: [String],
	psuedocode: [String],
	flowchart: {shapes:[shapeSchema],
				StageH:Number,
				}
}, { timestamps: { createdAt: 'created', updatedAt:'updated'}});
//var Subtopic=mongoose.model("SubTopic",subtopicSchema)

var topicSchema=new mongoose.Schema({
	title: String,
	subtopics:[subtopicSchema]
}, { timestamps: { createdAt: 'created', updatedAt:'updated'}});
//var Topic=mongoose.model("Topic",topicSchema)

var userSchema=new mongoose.Schema({
	first_name: String,
	last_name: String,
	username: String,
	password: String,
	topics:[topicSchema]
});

userSchema.plugin(passportLocalMongoose);
module.exports.User = mongoose.model("User",userSchema);
