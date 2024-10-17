sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/ng/admin/adminui/model/models",
	"./model/errorHandling"
], function (UIComponent, Device, models, errorHandling) {
	"use strict";

	return UIComponent.extend("com.ng.admin.adminui.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			
			// delegate error handling
			errorHandling.register(this);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// create the views based on the url/hash
			this.getRouter().initialize();
			this._initModels();
			
		},
		
		_initModels: function () {
			var userModel = this.getModel("user");
			
			if (document.URL.indexOf("webidetesting") > 0) {
				//Development Mode
				userModel.setData({
					"name": "vivekananda.panigrahy@sap.com",
					"role": "Scrubber"
				});
			} else {
				userModel.loadData("/datascrub/whoAmI", null, false);				
			}
		}
	});
});