sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/ng/datascrubautomation/utils/Formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"com/ng/datascrubautomation/utils/Helper",
	"sap/m/MessageBox"
], function (BaseController, Formatter, JSONModel, Fragment, Filter, Helper, MessageBox) {
	"use strict";

	return BaseController.extend("com.ng.datascrubautomation.controller.ExpenseItemAnalysis", {
		formatter: Formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ExpenseItemAnalysis").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.oModel = this.getOwnerComponent().getModel();

			var testingCommentsModel = new JSONModel();

			this.getView().setModel(testingCommentsModel, "testingCommentsModel");

			// Receipts
			/*this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);*/

		},

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

		_handleManualFindingChecklist: function () {
			var checklistSet = this.getView().getBindingContext().getObject().ITEM_SET;
			var oModel = this.getView().getModel();
			var testingCommentsModel = this.getView().getModel("testingCommentsModel");

			var oFilter = new Filter("ITEM_SET", "EQ", checklistSet);
			var aFilters = [];

			if (oFilter) {
				aFilters.push(oFilter);
			}

			oModel.read("/DS_CHECKLIST_DETAILS", {
				filters: aFilters,
				success: function (oData) {
					testingCommentsModel.setData(oData);
				},
				error: function (oError) {
				}
			});

		},

		_handleOpenReceipts: function () {

			var sSource = sap.ui.require.toUrl("com/ng/datascrubautomation/model") + "/img.pdf";
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My Custom Title");
			this._pdfViewer.open();

		},

		_handleAddTestingComments: function (oEvent) {
			var oView = this.getView();
			var that = this;

			if (this.getView().byId("idManualDispositionsTable").getTable().getItems().length > 0) {
				var manualStatus = oEvent.getSource().getBindingContext().getObject().MANUAL_STATUS;
				this.getView().getModel("testingCommentsModel").setProperty("/status", manualStatus);
				this.getView().getModel("testingCommentsModel").setProperty("/results", []);
			} else {
				this._handleManualFindingChecklist();
			}

			Fragment.load({
				name: "com.ng.datascrubautomation.fragments.TestingComments",
				controller: that
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.open();
			});
		},

		_handleEditTestingComments: function (oEvent) {
			var oView = this.getView();
			var that = this;
			var oBindingContext = oEvent.getSource().getBindingContext();

			Fragment.load({
				name: "com.ng.datascrubautomation.fragments.EditTestingComments",
				controller: that
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.setBindingContext(oBindingContext);
				oDialog.open();
			});
		},

		_handleTestingCommentsSave: function (oEvent) {
			var oModel = this.getView().getModel(),
				oTestModel = this.getView().getModel("testingCommentsModel"),
				oBindingObject = this.getView().getBindingContext().getObject(),
				aDispositions = [],
				oDispositionData,
				bPayloadValidation;

			var i = 0,
				oTestingData = oTestModel.getData();

			if (oTestingData.results) {
				for (i = 0; i < oTestingData.results.length; i++) {
					oDispositionData = this._fetchManualDispositionPayload(oBindingObject, oTestingData.results[i].DESCRIPTION,
						oTestingData.results[i].VALUE, oTestingData.results[i].ITEM);

					bPayloadValidation = this._validatePayload(oDispositionData);

					if (!bPayloadValidation) {
						MessageBox.show(
							"Please fill in all the values.", {
								icon: MessageBox.Icon.INFORMATION,
								title: "Information",
								actions: [MessageBox.Action.OK],
								onClose: function (oAction) {}
							}
						);
						return;
					}

					aDispositions.push(oDispositionData);

				}

				for (i = 0; i < aDispositions.length; i++) {
					Helper.createManualDisposition(oModel, aDispositions[i]);
				}
			}

			var statusData = {
				"PRC_ID": oBindingObject.PRC_ID,
				"REPORT_ID": oBindingObject.REPORT_ID,
				"ALLOCATION_KEY": oBindingObject.ALLOCATION_KEY,
				"REPORT_STATUS": oBindingObject.REPORT_STATUS || "",
				"MANUAL_STATUS": this.getView().getModel("testingCommentsModel").getProperty("/status"),
				"SYSTEM_STATUS": oBindingObject.SYSTEM_STATUS || "",
				"PRIORITY": ""
			};
			
			if(oBindingObject.SYSTEM_STATUS === null && oBindingObject.MANUAL_STATUS === null){
				Helper.createDispositionItemStatus(oModel, statusData);
			}
			else{
				Helper.updateDispositionItemStatus(oModel, statusData);	
			}

			// 

			oEvent.getSource().getParent().close();

		},

		_handleTestingCommentsUpdate: function (oEvent) {
			var oModel = this.getView().getModel(),
				oUserData = this.getView().getModel("user").getData(),
				sPath = oEvent.getSource().getBindingContext().getPath(),
				oPayload = oEvent.getSource().getBindingContext().getObject(),
				bPayloadValidation;

			oPayload.SAMPLED_FLAG = "";
			oPayload.DISPOSITION_REASON = "";
			if (oUserData.name) {
				oPayload.LAST_CHANGED_BY = oUserData.name;
			}

			bPayloadValidation = this._validatePayload(oPayload);

			if (!bPayloadValidation) {
				MessageBox.show(
					"Please fill in all the values.", {
						icon: MessageBox.Icon.INFORMATION,
						title: "Information",
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {}
					}
				);
				return;
			}

			Helper.updateManualDisposition(oModel, oPayload, sPath);
			oEvent.getSource().getParent().close();
		},

		_fetchManualDispositionPayload: function (oBindingObject, sDispositionEntity, sDispositionReason, sKey) {
			var oUserData = this.getView().getModel("user").getData();
			var sCurrentUser = "";
			if (oUserData.name) {
				sCurrentUser = oUserData.name;
			}

			var oDispositionData = {
				"REPORT_ID": oBindingObject.REPORT_ID,
				"PRC_ID": oBindingObject.PRC_ID,
				"ITEM": sKey,
				"DISPOSITION_REASON": sDispositionReason,
				"DISPOSITION_ENTITY": sDispositionEntity,
				"CREATED_BY": sCurrentUser,
				"LAST_CHANGED_BY": "",
				"SAMPLED_FLAG": "",
				"ALLOCATION_KEY": oBindingObject.ALLOCATION_KEY,
				"SCRUBBER_COMMENTS": "",
				"REVIEWER_COMMENTS": ""
			};

			if (oUserData.role === "Scrubber") {
				oDispositionData.SCRUBBER_COMMENTS = sDispositionReason;
			} else if (oUserData.role === "Reviewer") {
				oDispositionData.SCRUBBER_COMMENTS = sDispositionReason;
			}

			return oDispositionData;
		},

		_handleCommentsCancel: function (oEvent) {
			// oEvent.getSource()
			oEvent.getSource().getParent().close();
		},

		_validatePayload: function (oDispositionData) {
			var oUserData = this.getView().getModel("user").getData();

			if (this.getView().getModel("testingCommentsModel").getProperty("/status") !== 'DRAFT') {
				if ((oDispositionData.SCRUBBER_COMMENTS === undefined || oDispositionData.SCRUBBER_COMMENTS === '') && oUserData.role ===
					'Scrubber') {
					return false;
				} else if ((oDispositionData.REVIEWER_COMMENTS === undefined || oDispositionData.REVIEWER_COMMENTS === '') && oUserData.role ===
					'Reviewer') {
					return false;
				} else {
					return true;
				}
			}
			else{
				return true;
			}

		}

	});

});