jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 DS_USERS in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/ng/admin/securityui/securityui/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/ng/admin/securityui/securityui/test/integration/pages/App",
	"com/ng/admin/securityui/securityui/test/integration/pages/Browser",
	"com/ng/admin/securityui/securityui/test/integration/pages/Master",
	"com/ng/admin/securityui/securityui/test/integration/pages/Detail",
	"com/ng/admin/securityui/securityui/test/integration/pages/Create",
	"com/ng/admin/securityui/securityui/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.ng.admin.securityui.securityui.view."
	});

	sap.ui.require([
		"com/ng/admin/securityui/securityui/test/integration/MasterJourney",
		"com/ng/admin/securityui/securityui/test/integration/NavigationJourney",
		"com/ng/admin/securityui/securityui/test/integration/NotFoundJourney",
		"com/ng/admin/securityui/securityui/test/integration/BusyJourney",
		"com/ng/admin/securityui/securityui/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});