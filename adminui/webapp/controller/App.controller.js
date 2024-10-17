sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.ng.admin.adminui.controller.App", {

		onInit: function () {
			this._initializeAuthorizationModel();
		},

		_initializeAuthorizationModel: function () {
			var oAuthModel = this.getOwnerComponent().getModel("authorization");
			oAuthModel.loadData("/datascrub/checkAuthorization", null, false);

			var bManageConfig = oAuthModel.getProperty("/manageconfig");

			if (bManageConfig) {
				var oModel = new sap.ui.model.odata.v2.ODataModel({
					"serviceUrl": "/admin/admin.xsodata",
					"defaultOperationMode": "Server",
					"defaultBindingMode": "OneWay",
					"defaultCountMode": "Request",
					"refreshAfterChange": true,
					"defaultUpdateMethod": "PUT"
				});
				
				this.getOwnerComponent().setModel(oModel, "adminModel");
			}
		}

	});

});