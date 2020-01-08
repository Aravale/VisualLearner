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
	var Topic = req.body.Topicddl;
		var newStage = req.body.stagestate;
			var newCode = req.body.codestate;

			var newpsCode = req.body.pcodestate;

		var newsubTopic = req.body.subtopic;
	console.log(newStage);
	console.log(Topic);

	var cUser = req.user._id;
	console.log(cUser);

	User.findOne({ _id: cUser }, function(err, user) {
		if (err) {
			console.log(err);
		} else {
				user.topics.forEach(function(topic) {
			console.log(topic);
			if (topic._id == Topic) {
				topic.subtopics.push({ 
					name: newsubTopic,
					flowchart:newStage,
					code:newCode,
					psuedocode:newpsCode
				});
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