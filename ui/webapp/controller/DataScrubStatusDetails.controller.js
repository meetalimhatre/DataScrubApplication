sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/PDFViewer",
	"sap/m/Dialog",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"com/ng/datascrubautomation/utils/Formatter",
	"com/ng/datascrubautomation/utils/Helper"
], function (BaseController, MessageBox, PDFViewer, Dialog, History, Fragment, JSONModel, Formatter, Helper) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.DataScrubStatusDetails", {
		formatter: Formatter,
		handleRouteMatched: function (oEvent) {
			var oParams = {
				//"expand": "TO_JOURNAL_ENTRIES"
			};

			if (oEvent.getParameter('data').context) {
				this.sContext = oEvent.getParameter('data').context;

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
			}

		},

		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DataScrubStatusDetails").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.oModel = this.getOwnerComponent().getModel();

			var statusModel = new JSONModel();
			this.getView().setModel(statusModel, "statusModel");

		},


		_handleUserComments: function () {
			var oView = this.getView();
			var that = this;
			var PRC_ID = this.getView().getBindingContext().getObject().PRC_ID;
			var REPORT_ID = this.getView().getBindingContext().getObject().REPORT_ID;

			var sPath = "/DS_EXP_STATUS(PRC_ID=" + PRC_ID + ",REPORT_ID='" + REPORT_ID + "')";

			Fragment.load({
				name: "com.ng.datascrubautomation.fragments.Comments",
				controller: that
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.bindObject(sPath);
				oDialog.open();
			});
		},


		_handleCommentsSave: function (oEvent) {
			var oModel = this.getView().getModel();
			var oBindingObject = this.getView().getBindingContext().getObject();
			var statusModel = this.getView().getModel("statusModel");
			var oDialog = oEvent.getSource().getParent();
			var status = statusModel.getProperty("/REPORT_STATUS");
			var userId = this.getView().getModel("user").getProperty("/name");
			var logData = {
				"PRC_ID": oBindingObject.PRC_ID,
				"TEXT": statusModel.getProperty("/COMMENTS"),
				"USER_ID": userId || 'DUMMY',
				"REPORT_ID": oBindingObject.REPORT_ID,
				"SHORT_DESCRIPTION": "Status Changed to "+ status
			};
			Helper.saveProcessLog(oModel, logData);
			var statusData;
			if ((oBindingObject.SYS_STATUS === '' || oBindingObject.SYS_STATUS === null) && (oBindingObject.REP_STATUS === '' || oBindingObject
					.REP_STATUS ===
					null)) {
				statusData = {
					"PRC_ID": oBindingObject.PRC_ID,
					"REPORT_ID": oBindingObject.REPORT_ID,
					"REPORT_STATUS": status,
					"SYSTEM_STATUS": oBindingObject.SYS_STATUS || '',
					"PRIORITY": "LOW"
				};

				Helper.createDispositionStatus(oModel, statusData);

			} else {
				statusData = {
					"PRC_ID": oBindingObject.PRC_ID,
					"REPORT_ID": oBindingObject.REPORT_ID,
					"REPORT_STATUS": status,
					"MANUAL_STATUS": "",
					"SYSTEM_STATUS": oBindingObject.SYS_STATUS,
					"MATCHING_RULES": oBindingObject.MATCHING_RULES,
					"MATCHING_ENTITIES": oBindingObject.MATCHING_ENTITIES,
					"PRIORITY": "LOW"
				};

				Helper.updateDispositionStatus(oModel, statusData);
			}
			oDialog.close();
			this.getView().getModel("statusModel").setData({});
		},

		
		_handleCommentsCancel: function (oEvent) {
			oEvent.getSource().getParent().close();
			this.getView().getModel("statusModel").setData({});
		},

		_onBeforeRebindSyetmDispositionsTable: function (oEvent) {
			var binding = oEvent.getParameter("bindingParams");

			var oKeywordFilter = new sap.ui.model.Filter("DISPOSITION_TYPE", sap.ui.model.FilterOperator.EQ, "KEYWORD");
			var oRuleFilter = new sap.ui.model.Filter("DISPOSITION_TYPE", sap.ui.model.FilterOperator.EQ, "Rule");

			var oFilter = new sap.ui.model.Filter({
				filters: [
					oKeywordFilter, oRuleFilter
				],
				and: false
			});

			binding.filters.push(oFilter);
		},

		_onBeforeRebindManualDispositionsTable: function (oEvent) {
			var binding = oEvent.getParameter("bindingParams");
			var oFilter = new sap.ui.model.Filter("DISPOSITION_TYPE", sap.ui.model.FilterOperator.EQ, "MANUAL");
			binding.filters.push(oFilter);
		},

		_showActivityLogs: function () {
			var bSideContentVisibility = !this.getView().byId("DynamicSideContentStatusDetailsPage").getShowSideContent();
			this.getView().byId("DynamicSideContentStatusDetailsPage").setShowSideContent(bSideContentVisibility);
		},
		
		_onExpenseLineItemAnalysis: function(oEvent){
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				Helper.doNavigate(this.oRouter, "ExpenseItemAnalysis", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			
		},
		
		_onBeforeRebindExpenseLineItems: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			mBindingParams.parameters["expand"] = "TO_ITEM_STATUS";
		}
	});
}, /* bExport= */ true);