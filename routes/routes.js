var express = require('express');
var router = express.Router();
var { User } = require('../models/user'),
	passport = require('passport');

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/home');
		return;
	}
	return next();
}

function isNotLoggedIn(req, res, next) {
	console.log(req.isAuthenticated());
	if (!req.isAuthenticated()) {
		res.send({ error: 'Please Login First!' });
		return
	}
	return next();
}

router.get('/', isLoggedIn, function (req, res) {
	res.render('login');
});

router.get('/register', isLoggedIn, function (req, res) {
	res.render('reg');
});

router.get('/getsubtopic', isNotLoggedIn, function (req, res) {
	var topID = req.query.topicID;
	var subID = req.query.sbtopicID;

	var cUser = req.user._id;
	var subtopic = null;
	var topic = null;
	User.findOne({ _id: cUser }, function (err, user) {
		if (err) {
			console.log(err);
		}
		else {
			topic = user.topics.id(topID);
			subtopic = user.topics.id(topID).subtopics.id(subID);
		}
	 res.send({ "subtop": subtopic, "topictitle": topic.title });
	});
});

router.post('/register', function (req, res) {
	var newUser = new User({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username
	});
	User.register(newUser, req.body.password, function (err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.render('reg');
		}
	});
	return res.redirect('/');
});

router.post('/newtopic', isNotLoggedIn, function (req, res) {
	var newTopic = req.body.topic;
	var cUser = req.user._id;

	User.findOne({ _id: cUser }, function (err, user) {
		if (err) { return handleError(err); }
		user.topics.push({ title: newTopic });

		var topicid = "";
		var topictitle = "";
		var created = "";
		user.topics.forEach(topic => {
			topicid = topic._id;
			topictitle = topic.title;
			created = topic.created;
		});

		user.save(function (err) {
			if (err) { return handleError(err); }
			else {
				console.log('Topic Added!');
				return res.send({ "topicid": topicid, "topictitle": topictitle,"Tcreated":created });
			}
		});
	});
});

router.post('/newsubtopic', isNotLoggedIn, function (req, res) {
	var topID = req.body.topicid;
	var fc = req.body.fc;
	var newsubTopic = req.body.NewSubtopicName;
	var codearr = req.body.codearr;
	var psuedoarr = req.body.psuedoarr;
	var description= req.body.description;
	var cUser = req.user._id;
	var id="";
	var created="";
	User.findOne({ _id: cUser }, function (err, user) {
		if (err) {
			console.log(err);
		} else {
			 topic = user.topics.id(topID);
					topic.subtopics.push({
						name: newsubTopic,
						flowchart: fc,
						code: codearr,
						psuedocode: psuedoarr,
						description:description
					});
				id=topic.subtopics[topic.subtopics.length-1]._id;
				created=topic.subtopics[topic.subtopics.length-1].created;
			console.log(topic.subtopics.length);
			console.log("id:"+id);
			user.save(function (err, user) {
				if (err) {
					console.log(err);
				}
				else {
					console.log("New Sub added! For:"+user.username+" Topic:"+topic.title+" Subname:"+newsubTopic);
				}
			});
		}
	}).then(() =>
	{console.log("id:"+id);
	 res.send({ "subtopicid": id,"topicid":topID,"Screated":created});});
});

router.post('/updatesubtopic', isNotLoggedIn, function (req, res) {
	var topID = req.body.topicid;
	var subID = req.body.subtopicid;
	var description= req.body.description;
	var fc = req.body.fc;
	var UpdatedTopicName = req.body.UpTopNm;
	var UpdatedSubTopicName = req.body.UpSubNm;
	var codearr = req.body.codearr;
	var psuedoarr = req.body.psuedoarr;
	var cUser = req.user._id;
	var success=false;

	User.findOne({ _id: cUser }, function (err, user) {
		var topic = user.topics.id(topID);
		topic.title=UpdatedTopicName;
		var subtopic = user.topics.id(topID).subtopics.id(subID);
		subtopic.name = UpdatedSubTopicName;
		subtopic.code = codearr;
		subtopic.psuedocode = psuedoarr;
		subtopic.flowchart = fc;
		subtopic.description= description;
		user.save(function (err) {
			if (err) { return handleError(err); }
			console.log('Success Updated!');
			success=true;
			res.send({"success":success});
		});
	});
});

router.post('/delsubtopic', isNotLoggedIn, function (req, res) {
	var subID = req.body.subtopicID;
	var topID = req.body.topicID;
	var cUser = req.user._id;
	var success= false;
	console.log(cUser);
	User.findOne({ _id: cUser }, function (err, user) {
		if (err) {
			console.log(err);
		} else {
			user.topics.forEach(function (topic) {
				if (topic._id == topID) {
					topic.subtopics.remove({ _id: subID });
				}
			});

			user.save(function (err, user) {
				if (err) {
					console.log(err);
				} else {
					console.log("Done!");
					success=true;
					res.send({"success":success});
				}
			});
		}
	});
});

router.post('/deltopic', isNotLoggedIn, function (req, res) {
	var topID = req.body.topicID;
	var cUser = req.user._id;
	var success=false;
	console.log(cUser);
	User.findOne({ _id: cUser }, function (err, user) {
		if (err) {
			console.log(err);
		} else {
			user.topics.remove({ _id: topID });

			user.save(function (err, user) {
				if (err) {
					console.log(err);
				} else {
					console.log("Done!");
					success=true;
					res.send({"success":success});
				}
			});
		}
	});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/home',
	failureRedirect: '/',
	failureFlash: true
}),
	function (req, res) {

	}
);

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	return res.redirect('/');
});

router.get('/home', function (req, res) {
	res.render('home');
});

module.exports = router;