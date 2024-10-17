/*eslint no-console: 0*/
"use strict";

const express = require('express');
const app = express();
var passport = require("passport");
const port = process.env.PORT || 3000;
var xsenv = require("@sap/xsenv");
var xsHDBConn = require("@sap/hdbext");
var xssec = require("@sap/xssec");

var hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});

var xsUaaOptions = xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
});

passport.use("JWT", new xssec.JWTStrategy(xsUaaOptions.uaa));
app.use(passport.initialize());
app.use(
	passport.authenticate("JWT", {
		session: false
	}),
	xsHDBConn.middleware(hanaOptions.hana)
);
app.use(express.json());

app.get('/user', function (req, res, next) {
	if (req.user) {
		res.type("application/json").send('Application user: ' + req.user.id);
	} else {
		res.send('User Session not found.');
	}
});

/*

app.get('/test2', function (req, res, next) {

	var isAuthorized = req.authInfo.checkScope('uaa.user');
	if (isAuthorized) {
		res.send('Application user: ' + req.user.id);
	} else {
		res.status(403).send('Forbidden');
	}
});*/

app.post("/load_ta_configuration/:conf", function (req, res) {

	var isAuthorized = req.authInfo.checkScope("$XSAPPNAME.ManageConfig");
	if (isAuthorized) {

		var client = req.db;
		var sConfName = req.params.conf;
		client.prepare(
			"CALL CREATE_TA('" + sConfName + "')",
			function (err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function (error, results) {
						if (error) {
							res.type("text/plain").status(500).send("ERROR: " + err.toString());
							return;

						} else {
							var result = JSON.stringify({
								Objects: results
							});
							res.type("application/json").status(200).send(result);
						}
					});
			});

	}

});

app.post("/unload_ta_configuration/:conf", function (req, res) {

	var isAuthorized = req.authInfo.checkScope("$XSAPPNAME.ManageConfig");
	if (isAuthorized) {

		var client = req.db;
		var sConfName = req.params.conf;
		client.prepare(
			//"select * from \"CDS_DS.T_CONFIGURATIONS\"",
			"CALL DELETE_CONFIG('" + sConfName + "')",
			function (err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function (error, results) {
						if (error) {
							res.type("text/plain").status(500).send("ERROR: " + err.toString());
							return;

						} else {
							var result = JSON.stringify({
								Objects: results
							});
							res.type("application/json").status(200).send(result);
						}
					});
			});
	}
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));