/*eslint no-console: 0, no-unused-vars: 0, no-undef:0*/

"use strict";
var https = require("https");

var xsenv = require("@sap/xsenv");
var port = process.env.PORT || 3000;
var server = require("http").createServer();

https.globalAgent.options.ca = xsenv.loadCertificates();

global.__base = __dirname + "/";
var init = require(global.__base + "utils/initialize");

//Initialize Express App for XSA UAA and HDBEXT Middleware
var app = init.initExpress();

// var router = require("./router")(app, server);

app.get('/checkAuthorization', function (req, res, next) {

	var oAuth = {
		"createdatascrub": false,
		"sampledatascrub": false,
		"completedatascrub": false,
		"manageconfig": false
	};

	var isAuthorized;

	isAuthorized = req.authInfo.checkScope('$XSAPPNAME.CreateDataScrub');

	if (isAuthorized) {
		oAuth.createdatascrub = true;
	}

	isAuthorized = req.authInfo.checkScope('$XSAPPNAME.ManageConfig');

	if (isAuthorized) {
		oAuth.manageconfig = true;
	}

	isAuthorized = req.authInfo.checkScope('$XSAPPNAME.SampleDataScrub');

	if (isAuthorized) {
		oAuth.sampledatascrub = true;
	}

	isAuthorized = req.authInfo.checkScope('$XSAPPNAME.CompleteDataScrub');

	if (isAuthorized) {
		oAuth.completedatascrub = true;
	}

	res.type("application/json").status(200).send(oAuth);
});

app.get("/whoAmI", (req, res) => {
	var userContext = req.authInfo;
	var result = JSON.stringify({
		userContext: userContext
	});
	// res.type("application/json").status(200).send(result);

	var client = req.db;
	var email;
	var output = {};

	client.exec("SELECT SESSION_CONTEXT('XS_EMAIL') as \"name\" FROM DUMMY", function (err, rs) {
		if (err) {
			return res.end('Error: ' + err.message);
		}
		if(rs[0].name){
			output.name = rs[0].name;
		}
		//testing in WebIDE
		else{
			output.name = 'DUMMY_USER_WEBIDE';
		}
		
		var rolesql = "select ROLE from \"CDS_DS.T_USERS\" where EMAIL = '" + output.name + "'"; 

		client.exec(rolesql, function (err, rs) {
			if (err) {
				return res.end('Error: ' + err.message);
			}
			
			if(rs[0] && rs[0].ROLE){
				output.role = rs[0].ROLE;	
			}
			
			res.type("application/json").status(200).send(JSON.stringify(output));
		});
	});

});

app.get("/whoAmI2", (req, res) => {
	var userContext = req.authInfo;
	var result = JSON.stringify({
		userContext: userContext
	});
	// res.type("application/json").status(200).send(result);

	var client = req.db;

	var sql =
		"SELECT ALIAS.VALUE FROM JSON_TABLE ( ( ( '{\"values\" : ' || SESSION_CONTEXT ( 'XS_EMAIL' ) ) || '}' ) ,'$.values[*]' COLUMNS ( VALUE VARCHAR ( 5000 ) PATH '$' ) ) AS ALIAS ";

	client.exec(sql, function (err, rs) {
		if (err) {
			return res.end('Error: ' + err.message);
		}

		res.end(JSON.stringify(rs));
	});

});

app.get("/user", (req,res) =>{
	if (req.user) {
		res.send(req.user.name);
	}
	else{
		res.send('No User information found');
	}
});

init.initXSJS(app);

//Start the Server
server.on("request", app);

server.listen(port, function () {
	console.info("HTTP Server: " + server.address().port);
});