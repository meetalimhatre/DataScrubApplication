/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";
module.exports = {
	initExpress: function () {
		var xsenv = require("@sap/xsenv");
		var passport = require("passport");
		var xssec = require("@sap/xssec");
		var xsHDBConn = require("@sap/hdbext");
		var express = require("express");

		//logging
		var logging = require("@sap/logging");
		var appContext = logging.createAppContext();

		//Initialize Express App for XS UAA and HDBEXT Middleware
		var app = express();
		passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa));  
		app.use(logging.middleware({
			appContext: appContext
		}));

		app.use(passport.initialize());
		var hanaOptions = xsenv.getServices({
			hana: {
				tag: "hana"
			}
		});
		app.use(
	  	       passport.authenticate("JWT", {
				session: false
			}),
			xsHDBConn.middleware(hanaOptions.hana)
		);  
		return app;
	},

	initXSJS: function (app) {
		//	process.env.XS_APP_LOG_LEVEL='debug';
		var xsjs = require("@sap/xsjs");
		var xsenv = require("@sap/xsenv");
		var options = {
//			 anonymous : true, // remove to authenticate calls
			redirectUrl: "/datascrub.xsodata",
			context: {
				base: global.__base,
				env: process.env,
				answer: 42
			}
		};

		//configure HANA
		try {
			options = Object.assign(options, xsenv.getServices({
				hana: {
					tag: "hana"
				}
			}));

		} catch (err) {
			console.log("[WARN]", err.message);
		}

		// configure UAA
		try {
			options = Object.assign(options, xsenv.getServices({
				uaa: {
					tag: "xsuaa"
				}
			}));
		} catch (err) {
			console.log("[WARN]", err.message);
		}

		// audit log
		/*try {
			options = Object.assign(options, xsenv.getServices({
				auditLog: {
					tag: "auditlog-management"
				}
			}));

			console.log(options);
		} catch (err) {
			console.log("[WARN]", err.message);
		}*/

		// start server
		var xsjsApp = xsjs(options);
		app.use(xsjsApp);
	}

};