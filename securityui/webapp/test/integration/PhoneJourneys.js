jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/ng/admin/securityui/securityui/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/ng/admin/securityui/securityui/test/integration/pages/App",
	"com/ng/admin/securityui/securityui/test/integration/pages/Browser",
	"com/ng/admin/securityui/securityui/test/integration/pages/Master",
	"com/ng/admin/securityui/securityui/test/integration/pages/Detail",
	"com/ng/admin/securityui/securityui/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.ng.admin.securityui.securityui.view."
	});

	sap.ui.require([
		"com/ng/admin/securityui/securityui/test/integration/NavigationJourneyPhone",
		"com/ng/admin/securityui/securityui/test/integration/NotFoundJourneyPhone",
		"com/ng/admin/securityui/securityui/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});