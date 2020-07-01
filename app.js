const DATABASE_URL="mongodb://localhost:27017/TestDB"
const SESSION="mongodb://localhost:27017/connect_mongodb_session_test"
const DATABASE_URL_LIVE="mongodb+srv://aravale:mypassword123@cluster0.7ffbj.mongodb.net/vldb?retryWrites=true&w=majority"
const SESSION_LIVE="mongodb+srv://aravale:mypassword123@cluster0.7ffbj.mongodb.net/connect_mongodb_session_test?retryWrites=true&w=majority"
var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require("connect-flash"),
	LocalStrategy = require('passport-local'),
	{User} = require('./models/user');
	session = require('express-session');
	var MongoDBStore = require('connect-mongodb-session')(session);
	

var indexRoutes = require('./routes/routes');
//App Config
var mystore = new MongoDBStore({
	uri: SESSION_LIVE,
	collection: 'mySessions'
  });
   
  // Catch errors
  mystore.on('error', function(error) {
	console.log(error);
  });

try {
	mongoose.connect(DATABASE_URL_LIVE, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
} catch (error) {
	console.error(error);
	
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
//app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
//Passport Config
app.use(require('express-session')({
	secret: 'VLTKL1',
	cookie: {
	  maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
	},
	store: mystore,
	resave: false,
	saveUninitialized: false
  }));
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
	console.log('Unhandled rejection at ', promise, `reason: ${reason.message}`)
	app.exit(1)
});