var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash       = require("connect-flash"),
	LocalStrategy = require('passport-local'),
	User = require('./models/user');

var indexRoutes = require('./routes/index');
//App Config
mongoose.connect('mongodb://localhost:27017/TestDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
//app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
//Passport Config
app.use(
	require('express-session')({
		secret: 'VLTest1htstring',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);

/*User.findOne({ username: '2@gmail.com' }, function(err, user) {
	if (err) {
		console.log(err);
	} else {
		 /*user.topics.push({
            title: "C Control Statements",
        });
		user.topics.forEach(function(topic) {
			//console.log(topic);
			if (topic.title == 'C tutorial') {
			//	console.log(topic);
				//topic.subtopics.push({ name: 'Basics' });
				//topic.subtopics.push({ name: 'Variables' });
			}
		});
		user.save(function(err, user) {
			if (err) {
				console.log(err);
			} else {
				// console.log(user);
			}
		});
	}
});*/
app.listen(3001, function() {
	console.log('server is running');
});