var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require("connect-flash"),
	LocalStrategy = require('passport-local'),
	{User} = require('./models/user');

var indexRoutes = require('./routes/routes');
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
passport.serializeUser(function(user, done) {
	done(null, user.id);
  });
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	let	cUser={
			_id:user._id,
			first_name:user.first_name,
			last_name:user.last_name,
			username:user.username,
			topics:user.topics
		}
	  done(err, cUser);
	});});

app.use(function (req, res, next) {
	if (req.user) {
		console.log(req.user);
		res.locals.currentUser={
			_id:req.user._id,
			first_name:req.user.first_name,
			last_name:req.user.last_name,
			username:req.user.username,
			topics:req.user.topics
		}
	}
	else{
		res.locals.currentUser=null;
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);

app.listen(3000, function () {
	console.log('server is running');
});

app.on('uncaughtException', err => {
	console.log(`Uncaught Exception: ${err.message}`)
	app.exit(1)
});

app.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled rejection at ', promise, `reason: ${err.message}`)
	app.exit(1)
});