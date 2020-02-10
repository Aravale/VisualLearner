var express = require('express');
var router = express.Router();
var User = require('../models/user'),
	passport = require('passport');

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		req.flash('error', 'Please Logout First!');
		res.redirect('/login');
	}
	return next();
}

function isNotLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		req.flash('error', 'Please Login First!');
		res.redirect('/login');
	}
	return next();
}

router.get('/', function(req, res) {
	res.render('home');
});

router.get('/login', isLoggedIn, function(req, res) {
	res.render('login');
});

router.get('/register', isLoggedIn, function(req, res) {
	res.render('reg');
});

router.get('/getsubtopic', isNotLoggedIn, function(req, res) {
	var topid = req.query.topicID;
	var subtopid = req.query.sbtopicID;

	var cUser = req.user._id;

	User.findOne({ _id: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
				user.topics.forEach(function(topic) {
			if (topic._id == topid) {
				topic.subtopics.forEach(function(subtopic){
		
						if (subtopic._id==subtopid) {
							res.send({"subtop":subtopic,"topictitle":topic.title});
						}
					
				});
				
			}
		});
		}
	});
});

router.post('/register', function(req, res) {
	var newUser = new User({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username
	});
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.render('reg');
		}
		res.redirect('/login');
	});
});

router.post('/newtopic', isNotLoggedIn, function(req, res) {
	var newTopic = req.body.topic;
	var cUser = req.user.username;
	console.log(cUser);

	User.findOne({ username: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			user.topics.push({
				title: newTopic
			});

			user.save(function(err, user) {
				if (err) {
					console.log(err);
				} else {
					res.redirect('/home');
				}
			});
		}
	});
});

router.post('/newsubtopic', isNotLoggedIn, function(req, res) {
	var Topic = req.body.topic;
	var height = req.body.StageHeight;
	var width = req.body.StageWidth;
	var shapes = req.body.Shapes;
	var newsubTopic = req.body.sbtopic;

	var fc={
		shapes:shapes,
		StageH:height,
		StageW:width
	}
	var cUser = req.user._id;

	User.findOne({ _id: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
				user.topics.forEach(function(topic) {
			//console.log(topic);
			if (topic.title == Topic) {
				topic.subtopics.push({ 
					name: newsubTopic,
					flowchart:fc
				});
				console.log(fc);
			}
		});
		user.save(function(err, user) {
			if (err) {
				console.log(err);
			} else {
				 console.log("Done!");
			}
		});
		}
	});
	res.redirect('/home');
});

router.post('/delsubtopic', isNotLoggedIn, function(req, res) {
	var subID = req.body.subtopicID;
	var topID = req.body.topicID;
	var cUser = req.user._id;
console.log(cUser);
	User.findOne({ _id: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			user.topics.forEach(function(topic) {
				if (topic._id == topID) {
					topic.subtopics.remove({ _id: subID });
				}
			});

			user.save(function(err, user) {
				if (err) {
					console.log(err);
				} else {
					 console.log("Done!");
				}
			});
		}	
	});
	res.redirect('/home');
});

router.post('/deltopic', isNotLoggedIn, function(req, res) {
	var topID = req.body.topicID;
	var cUser = req.user._id;
console.log(cUser);
	User.findOne({ _id: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			user.topics.remove({ _id: topID });

			user.save(function(err, user) {
				if (err) {
					console.log(err);
				} else {
					 console.log("Done!");
				}
			});
		}	
	});
	res.redirect('/home');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}),
	function(req, res) {}
);

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/login');
});

router.get('/home', function(req, res) {
	res.render('home');
});

module.exports = router;