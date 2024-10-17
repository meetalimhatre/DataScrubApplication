sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./ScubberReviewerQuickview",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, ScubberReviewerQuickview, History) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.DataScrubConfiguration", {
		handleRouteMatched: function(oEvent) {
			var oParams = {
				"expand": "TO_CONFIGURATION"
			};

			if (oEvent.getParameter('data').context) {
				this.sContext = oEvent.getParameter('data').context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		
		getQueryParameters: function(oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		formatFractionDigitFromValue: function(sValue) {
			var sNumber;
			if (isNaN(sValue)) {
				sNumber = sValue;
			} else {
				sNumber = Number(sValue).toFixed(2);
			}
			return sNumber;

		},
		_onAvatarPress: function(oEvent) {

			var sQuickviewName = "ScubberReviewerQuickview";
			this.mQuickviews = this.mQuickviews || {};
			var oQuickview = this.mQuickviews[sQuickviewName];

			if (!oQuickview) {
				oQuickview = new ScubberReviewerQuickview(this.getView());
				this.mQuickviews[sQuickviewName] = oQuickview;

				oQuickview.getControl().setPlacement("Auto");

				// For navigation.
				oQuickview.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oQuickview.open(oSource);

		},
		_onAvatarPress1: function(oEvent) {

			var sQuickviewName = "ScubberReviewerQuickview";
			this.mQuickviews = this.mQuickviews || {};
			var oQuickview = this.mQuickviews[sQuickviewName];

			if (!oQuickview) {
				oQuickview = new ScubberReviewerQuickview(this.getView());
				this.mQuickviews[sQuickviewName] = oQuickview;

				oQuickview.getControl().setPlacement("Auto");

				// For navigation.
				oQuickview.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oQuickview.open(oSource);

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DataScrubConfiguration").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		onExit: function() {

		}
	});
}, /* bExport= */ true);
