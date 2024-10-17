sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/ng/datascrubautomation/utils/Formatter",
	"sap/ui/core/Fragment",
	"com/ng/datascrubautomation/utils/Helper",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Formatter, Fragment, Helper, MessageBox) {
	"use strict";

	return Controller.extend("com.ng.datascrubautomation.controller.App", {
		formatter: Formatter,

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.getView().setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			this._initializeAuthorizationModel();

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		},

		_initializeAuthorizationModel: function () {
			var oAuthModel = this.getOwnerComponent().getModel("authorization");
			oAuthModel.loadData("/datascrub/checkAuthorization", null, false);
		},

		_handleMenuItemSelected: function (oEvent) {
			// var oMenuItem = oEvent.getParameter("item");

			if (document.URL.indexOf("nationalgridprod") > 0) {
				sap.m.URLHelper.redirect("https://national-grid-nationalgridprod-prod-adminui.cfapps.us10.hana.ondemand.com", true);
			} else {
				sap.m.URLHelper.redirect("https://national-grid-ec-cf-nonprod-org-dev-adminui.cfapps.us10.hana.ondemand.com", true);
			}
		},

		_openUserPopover: function (oEvent) {
			var oControl = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "com.ng.datascrubautomation.fragments.UserPopover",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oControl);
				}.bind(this));
			} else {
				this._oPopover.openBy(oControl);
			}

		},
		
		handleLogoutPress: function(){
			sap.m.URLHelper.redirect("/do/logout", false);
		},

		navToHome: function (oEvent) {
			var oBindingContext = "";
			return new Promise(function (fnResolve) {
				Helper.doNavigate(this.oRouter, "DataScrubLanding", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		}
	});

});