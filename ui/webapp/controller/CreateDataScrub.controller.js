sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, History) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.CreateDataScrub", {
		handleRouteMatched: function(oEvent) {

			var oParams = {};

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
		_onDateRangeSelectionChange: function(oEvent) {

			var oDateRangeSelection = oEvent.getSource();
			var oBindingContext = oDateRangeSelection.getBindingContext();
			var sBindingPathOfDateValue = oDateRangeSelection.getBindingPath("dateValue");
			var sBindingPathOfSecondDateValue = oDateRangeSelection.getBindingPath("secondDateValue");
			var oFrom = oEvent.getParameter("from");
			if (oBindingContext && sBindingPathOfDateValue && oFrom) {
				var oFromBefore = oBindingContext.getModel().getProperty(sBindingPathOfDateValue, oBindingContext);
				if (oFromBefore) {
					var oUTCFrom = new Date(Date.UTC(oFrom.getFullYear(), oFrom.getMonth(), oFrom.getDate(), oFromBefore.getUTCHours(), oFromBefore.getUTCMinutes(), oFromBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfDateValue, oUTCFrom, oBindingContext);
				}
			}
			var oTo = oEvent.getParameter("to");
			if (oBindingContext && sBindingPathOfSecondDateValue && oTo) {
				var oToBefore = oBindingContext.getModel().getProperty(sBindingPathOfSecondDateValue, oBindingContext);
				if (oToBefore) {
					var oUTCTo = new Date(Date.UTC(oTo.getFullYear(), oTo.getMonth(), oTo.getDate(), oToBefore.getUTCHours(), oToBefore.getUTCMinutes(), oToBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfSecondDateValue, oUTCTo, oBindingContext);
				}
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
		_onNavBack: function() {
			this.clearModel();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("DataScrubLanding", true);
			}

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("CreateDataScrub").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			var oJsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonModel, "changeModel");
			
			oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.loadData("/datascrub/journalentriesdate.xsjs", null, false);
			this.getView().setModel(oJsonModel, "dateModel");
			

		},
		onExit: function() {

		},
		
		_onSavePress: function(oEvent){
			
			var oModel = this.getView().getModel("adminModel"),
				changeModel = this.getView().getModel("changeModel");
			
			var oData = changeModel.getData();
			oData.START_DATE = this.getView().byId("daterangeselection").getDateValue();
			oData.END_DATE = this.getView().byId("daterangeselection").getSecondDateValue();
			
			var that = this;
			oModel.create("/DS_PROCESS_MANAGE",oData,{
				success: function(oResponse){
					that.clearModel();
					that._onNavBack();
					
				},
				error: function(){
					that.clearModel();
					// that._onNavBack();
				}
			});
		},
		
		clearModel: function(){
			this.getView().getModel("changeModel").setData({});
			this.getView().byId("daterangeselection").setDateValue(null);
			this.getView().byId("daterangeselection").setSecondDateValue(null);
		},
		
		formateMinDate: function(sValue){
			if(sValue){
				var oDate = new Date(sValue);
				var utcDate = oDate.getUTCDate();
				var utcMonth = oDate.getUTCMonth();
				var utcFullYear = oDate.getUTCFullYear();
				return new Date(utcFullYear,utcMonth,utcDate);
			}
			else{
				return new Date(2018,0,1);
			}
		},
		
		formateMaxDate: function(sValue){
			if(sValue){
				var oDate = new Date(sValue);
				var utcDate = oDate.getUTCDate();
				var utcMonth = oDate.getUTCMonth();
				var utcFullYear = oDate.getUTCFullYear();
				return new Date(utcFullYear,utcMonth,utcDate);
			}
			else{
				return new Date();
			}
		}
	});
}, /* bExport= */ true);
