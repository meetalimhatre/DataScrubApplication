sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/ng/datascrubautomation/utils/Formatter",
	"com/ng/datascrubautomation/utils/Helper"
	
], function (BaseController, MessageBox, History, Filter, FilterOperator,Formatter, Helper) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.DataScrubLanding", {
		formatter: Formatter,
		handleRouteMatched: function (oEvent) {

			var oParams = {};

			if (oEvent.getParameter("data").context) {
				this.sContext = oEvent.getParameter("data").context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
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
			this.getView().byId("idDataScrubTable").getTable().removeSelections();
			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}
			else{
				var oParentTableBinding = this.getView().byId("idDataScrubTable").getTable().getBinding("items");
				if(oParentTableBinding){
					oParentTableBinding.refresh();	
				}
				
			}

		},
		_handleLoadDataScrubStatus: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			return new Promise(function (fnResolve) {
				Helper.doNavigate(this.oRouter, "DataScrubStatus", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onFioriListReportTableUpdateFinished: function (oEvent) {
			var oTable = oEvent.getSource();
			var oHeaderbar = oTable.getAggregation("headerToolbar");
			if (oHeaderbar && oHeaderbar.getAggregation("content")[1]) {
				var oTitle = oHeaderbar.getAggregation("content")[1];
				if (oTable.getBinding("items") && oTable.getBinding("items").isLengthFinal()) {
					oTitle.setText("(" + oTable.getBinding("items").getLength() + ")");
				} else {
					oTitle.setText("(1)");
				}
			}

		},
		_handleCreateDataScrub: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			return new Promise(function (fnResolve) {
				Helper.doNavigate(this.oRouter, "CreateDataScrub", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DataScrubLanding").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "idDataScrubsmartFilterBar",
				"groups": ["items"]
			}, {
				"controlId": "idDataScrubTable",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				for (var j = 0; j < aControls[i].groups.length; j++) {
					var sAggregationName = aControls[i].groups[j];
					var oBindingInfo = oControl.getBindingInfo(sAggregationName);
					var oTemplate = oBindingInfo.template;
					oTemplate.destroy();
				}
			}

		},

		_onSearchDataScrubs: function (oEVent) {
			// build filter array
			var aFilter = [];
			var sQuery = oEVent.getSource().getBasicSearchValue();
			if (sQuery) {
				aFilter.push(new Filter("DATA_SCRUB_NAME", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("idDataScrubsTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		}
	});
}, /* bExport= */ true);