sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/ng/datascrubautomation/utils/Helper",
	"com/ng/datascrubautomation/utils/Formatter",
	"sap/m/MessageToast"
], function (BaseController, MessageBox, History, Filter, FilterOperator, Helper, Formatter, MessageToast) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.DataScrubStatus", {
		formatter: Formatter,
		handleRouteMatched: function (oEvent) {
			var oParams = {
				//"expand": "TO_PROCESS_STATS"
			};
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

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};

				this.getView().bindObject(oPath);

				this.getView().byId("idDataScrubReportsTable").getTable().removeSelections();
				this._updateReviewAggregates(oPath);

				var oDS_Data = this.getView().getModel().getContext(oPath.path).getObject();
				this.getView().getModel("status").setData(oDS_Data);


				if(this.getView().byId("idDataScrubsmartFilterBar").isInitialised()){
					this._loadMatchingEntities();
				}
				// this._onApplyCustomFilterValues();
			}

		},

		_updateReviewAggregates: function (sContext) {
			this.getView().getModel().invalidateEntry(sContext);
			this.getView().byId("idAggregationBox").bindElement("TO_PROCESS_STATS");
		},

		_onFioriListReportTableItemPress: function (oEvent) {
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			return new Promise(function (fnResolve) {
				Helper.doNavigate(this.oRouter, "DataScrubStatusDetails", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DataScrubStatus").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		onExit: function () {

		},

		/*_onSampleDispositions: function (oEvent) {
			var oModel = this.getView().getModel();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var PRC_ID = oEvent.getSource().getBindingContext().getObject().PRC_ID;

			var userId = this.getView().getModel("user").getProperty("/name");

			var payload = {
				"PRC_ID": PRC_ID,
				"TEXT": "Assignment Done.",
				"USER_ID": userId,
				"SHORT_DESCRIPTION": "Sampling done by Admin"

			};
			Helper.saveProcessLog(oModel, payload);

			oBindingObject.STATUS_ID = "REVIEW_IN_PROGRESS";
			Helper.updateProcessStatus(oModel, oBindingObject);
			oModel.refresh();
		},*/

		_onSystemDispositionFilterSelect: function (oEvent) {
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("changedItem").getKey();
			if (sQuery && oEvent.getParameter('selected')) {
				aFilter.push(new Filter("SYS_STATUS", FilterOperator.EQ, 'EXCLUDED'));
			}

			// filter binding
			var oList = this.getView().byId("idDispositionReportsTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},

		_onCompleteDataScrub: function (oEvent) {
			var oModel = this.getView().getModel("adminModel"),
				oRefreshModel = this.getView().getModel();
			var updatePayload = this.getView().getBindingContext().getObject();
			updatePayload.STATUS_ID = "DS_COMPLETE";

			var completeDataScrubPromise = new Promise(function (resolve, reject) {
				Helper.updateProcessStatus(oModel, updatePayload, resolve, reject);
			}).then(function () {
				oRefreshModel.refresh();
			}).catch(function () {

			});

		},

		_onBeforeRebindDatascrubReports: function (oEvent) {
			var oSmartFilterBar = this.getView().byId("idDataScrubsmartFilterBar"),
				oControl1 = oSmartFilterBar.getControlByKey("CustomKeywordFilter"),
				oControl2 = oSmartFilterBar.getControlByKey("CustomRuleFilter");

			var aCustomFilters = [],
				oFilter,
				i,
				aQuery;

			if (oControl1.getSelectedKeys().length) {
				aQuery = oControl1.getSelectedKeys();
				if (aQuery.length) {
					for (i = 0; i < aQuery.length; i++) {
						aCustomFilters.push(new Filter("MATCHING_ENTITIES", FilterOperator.Contains, aQuery[i]));
					}
				}
				oFilter = new Filter({
					filters: aCustomFilters,
					and: false
				});

				oEvent.getParameter("bindingParams").filters.push(oFilter);
				aCustomFilters = [];

			}

			if (oControl2.getSelectedKeys().length) {
				aQuery = oControl2.getSelectedKeys();
				if (aQuery.length) {
					for (i = 0; i < aQuery.length; i++) {
						aCustomFilters.push(new Filter("MATCHING_RULES", FilterOperator.Contains, aQuery[i]));
					}
				}
				oFilter = new Filter({
					filters: aCustomFilters,
					and: false
				});
				oEvent.getParameter("bindingParams").filters.push(oFilter);
				aCustomFilters = [];
			}

			/*if (this.getView().getBindingContext()) {
				var prcId = oEvent.getSource().getBindingContext().getObject().PRC_ID;
				var oFilter1 = new Filter("PRC_ID", FilterOperator.Contains, prcId),
					oFilter2 = new Filter("DISPOSITION_TYPE", FilterOperator.Contains, 'KEYWORD'),
					oFilter3 = new Filter("DISPOSITION_TYPE", FilterOperator.Contains, 'Rule'),
					oBinding1 = oControl1.getBinding("items"),
					oBinding2 = oControl2.getBinding("items"),
					aFilters1 = [],
					aFilters2 = [];
				aFilters1.push(oFilter1);
				aFilters1.push(oFilter2);
				oBinding1.filter(aFilters1);
				aFilters2.push(oFilter1);
				aFilters2.push(oFilter3);
				oBinding2.filter(aFilters2);
			}*/
		},

		_loadMatchingEntities: function (oEvent) {
			var prcId = this.oRouter.getHashChanger().hash.split("PRC_ID=")[1].substr(0,2);
			var oFilter1 = new Filter("PRC_ID", FilterOperator.Contains, prcId),
				oFilter2 = new Filter("DISPOSITION_TYPE", FilterOperator.Contains, 'KEYWORD'),
				oFilter3 = new Filter("DISPOSITION_TYPE", FilterOperator.Contains, 'Rule'),
				aFilters1 = [],
				aFilters2 = [],
				oBinding1 = this.getView().byId("idDataScrubsmartFilterBar").getControlByKey("CustomKeywordFilter").getBinding("items"),
				oBinding2 = this.getView().byId("idDataScrubsmartFilterBar").getControlByKey("CustomRuleFilter").getBinding("items");

			aFilters1.push(oFilter1);
			aFilters1.push(oFilter2);
			oBinding1.filter(aFilters1);
			
			aFilters2.push(oFilter1);
			aFilters2.push(oFilter3);
			oBinding2.filter(aFilters2);
		}
	});
}, /* bExport= */ true);