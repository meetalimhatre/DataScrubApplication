sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Controller, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("com.ng.admin.adminui.controller.ManageRule", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._oMeta = this.getOwnerComponent().getModel("adminModel").getServiceMetadata();
			this._initializeModels();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TargetRule").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},

		handleRouteMatched: function (oEvent) {
			if (oEvent.getParameter('data').context) {
				var ruleData;
				ruleData = this.getView().getModel().getContext("/DS_RULES('" + oEvent.getParameter('data').context + "')").getObject();
				this.getView().getModel("rule").setData(ruleData);

				this.getView().getModel("Change").setData({
					"mode": "edit"
				});

				if (ruleData.RULE_EXPRESSION_JSON && ruleData.RULE_EXPRESSION_JSON.length > 0) {
					this.getView().getModel("advancedrule").setData({
						"enabled": false
					});

					var oExpressionData = JSON.parse(ruleData.RULE_EXPRESSION_JSON);
					this.getView().getModel("Expression").setData(oExpressionData);
				} else {
					this.getView().getModel("advancedrule").setData({
						"enabled": true
					});
				}

			} else {
				this._clearModel();
			}
		},

		_initializeModels: function () {
			var entryModel;

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "rule");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "advancedrule");
			entryModel.setData({
				enabled: false
			});

			entryModel = new JSONModel();
			entryModel.setData({
				TYPES: [{
					"text": "EXPENSE"
				}, {
					"text": "DISPOSITIONS"
				}, {
					"text": "ALLOCATIONS"
				}]
			});
			this.getView().setModel(entryModel, "ExpressionType");

			entryModel = new JSONModel();
			entryModel.setData({
				VALUETYPES: [{
					"text": "CUSTOM_VALUE"
				}, {
					"text": "EXPENSE"
				}, {
					"text": "DISPOSITIONS"
				}]
			});
			this.getView().setModel(entryModel, "ValueType");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "ExpressionSelection");

			entryModel = new JSONModel();
			entryModel.setData([]);
			this.getView().setModel(entryModel, "Expression");

			entryModel = new JSONModel();
			entryModel.setData({
				"mode": "create"
			});
			this.getView().setModel(entryModel, "Change");

		},

		_loadExpressionFieldModel: function (oEvent) {

			var sExpressionType = oEvent.getParameter("selectedItem").getKey();
			var entityTypeMapper = {
				"EXPENSE": "DS_RULE_DATAType",
				"DISPOSITIONS": "DS_SYSTEM_DISPOSITIONSType",
				"ALLOCATIONS": "ALLOCATION_CODESType"
			};

			var entityType = entityTypeMapper[sExpressionType];
			var aFields = this._oMeta.dataServices.schema[0].entityType.filter(function (v) {
				return v.name === entityType;
			})[0].property;
			var oExpressionModel = this.getView().getModel("Expression");

			var oData = {
				"FIELDS": aFields
			};

			var sCurrentIndex = oEvent.getSource().getBindingContext("Expression").getPath().split("/")[1];

			//oEvent.getSource().getBindingContext("Expression").setProperty("EXPRESSION_FIELD", oData);

			var oCurrentData = oExpressionModel.getData();
			oCurrentData[sCurrentIndex].EXPRESSION_FIELD = oData;

			oExpressionModel.setData(oCurrentData);

		},

		_loadValueFieldModel: function (oEvent) {
			var sExpressionType = oEvent.getParameter("selectedItem").getKey();
			var entityTypeMapper = {
				"EXPENSE": "DS_RULE_DATAType",
				"DISPOSITIONS": "DS_SYSTEM_DISPOSITIONSType"
			};

			var entityType = entityTypeMapper[sExpressionType];

			if (entityType) {
				var aFields = this._oMeta.dataServices.schema[0].entityType.filter(function (v) {
					return v.name === entityType;
				})[0].property;
				var oExpressionModel = this.getView().getModel("Expression");

				var oData = {
					"FIELDS": aFields
				};

				var sCurrentIndex = oEvent.getSource().getBindingContext("Expression").getPath().split("/")[1];

				var oCurrentData = oExpressionModel.getData();
				oCurrentData[sCurrentIndex].VALUE_FIELD = oData;
				oExpressionModel.setData(oCurrentData);
			}

		},

		_onAddExpressionRow: function () {
			var expressionData = {
				"EXPRESSION_FIELD": "",
				"EXPRESSION_TYPE": "",
				"OPERATOR": "",
				"VALUE_FIELD": "",
				"VALUE_TYPE": "",
				"EXPRESSION_CONJUCTION": "AND"
			};

			var existingExpressionData = this.getView().getModel("Expression").getData();
			existingExpressionData.push(expressionData);
			this.getView().getModel("Expression").setData(existingExpressionData);

		},

		_onDeleteExpressionRow: function (oEvent) {

			var oSource = oEvent.getSource();
			var iDeletionRow = parseInt(oSource.getBindingContext("Expression").getPath().split("/")[1], 10);
			var aExpressionData = oSource.getModel("Expression").getData();

			if (iDeletionRow > -1) {
				aExpressionData.splice(iDeletionRow, 1);
			}

			oSource.getModel("Expression").setData(aExpressionData);
		},

		_onExpressionTypeSelected: function (oEvent) {

		},

		_onRuleValidate: function (oEvent) {
			var sExpression = "";
			var aExpressionData = this.getView().getModel("Expression").getData();
			var oExpressionData, sValueExpression, sOperatorExpression;
			var i;

			for (i = 0; i < aExpressionData.length; i++) {
				oExpressionData = aExpressionData[i];
				sValueExpression = "";
				sOperatorExpression = "";

				if (oExpressionData.OPERATOR === "EQ") {
					sValueExpression = "'" + oExpressionData.VALUE + "'";
					sOperatorExpression = "=";
				} else if (oExpressionData.OPERATOR === "NE") {
					sValueExpression = "'" + oExpressionData.VALUE + "'";
					sOperatorExpression = "!=";
				} else if (oExpressionData.OPERATOR === "IN") {
					sValueExpression = "('" + oExpressionData.VALUE + "')";
					sOperatorExpression = "in";
				} else if (oExpressionData.OPERATOR === "NIN") {
					sValueExpression = "('" + oExpressionData.VALUE + "')";
					sOperatorExpression = "not in";
				} else if (oExpressionData.OPERATOR === "LIKE") {
					sValueExpression = "'%" + oExpressionData.VALUE + "%'";
					sOperatorExpression = "like";
				}

				if (oExpressionData.VALUE_TYPE === 'CUSTOM_VALUE') {

					sExpression = sExpression + " (" + oExpressionData.SELECTED_EXPRESSION_FIELD + " " + sOperatorExpression + " " + sValueExpression +
						" )";

				} else {
					sExpression = sExpression + "(" + oExpressionData.SELECTED_EXPRESSION_FIELD + " " + sOperatorExpression + " " + oExpressionData.SELECTED_VALUE_FIELD +
						") ";
				}

				if (i !== aExpressionData.length - 1) {
					sExpression = sExpression + " " + oExpressionData.EXPRESSION_CONJUCTION + " ";
				}
			}

			this.getView().getModel("rule").setProperty("/RULE_EXPRESSION", sExpression);
		},

		_onRuleSave: function (oEvent) {

			var pModel = this.getView().getModel("rule"),
				advancedruleModel = this.getView().getModel("advancedrule"),
				payload = pModel.getData(),
				sMode = this.getView().getModel("Change").getData().mode,
				oExpressionPayload = this.getView().getModel("Expression").getData();

			if (advancedruleModel.getProperty("/enabled")) {
				payload.RULE_EXPRESSION_JSON = "";
			} else {
				payload.RULE_EXPRESSION_JSON = JSON.stringify(oExpressionPayload);
			}
			if (sMode === "create") {
				this._handleCreateConfigurationEntries(oEvent, payload, "DS_RULES");
			} else if (sMode === "edit") {
				this._handleEditConfigurationEntries(oEvent, payload, "DS_RULES('" + payload.RULE_NAME + "')");
			}
		},

		_handleCreateConfigurationEntries: function (oEvent, oPayload, sEntityName) {
			var oModel = this.getView().getModel("adminModel"),
				oRefreshModel = this.getView().getModel();
			var that = this;

			oModel.create("/" + sEntityName, oPayload, {
				success: function (oResult) {
					that._clearModel();
					oRefreshModel.refresh();
					that.oRouter.navTo("Home");
				},
				error: function (oError) {

				}
			});
		},

		_handleEditConfigurationEntries: function (oEvent, oPayload, sEntityName) {
			var oModel = this.getView().getModel("adminModel"),
				oRefreshModel = this.getView().getModel();
			var that = this;

			oModel.update("/" + sEntityName, oPayload, {
				success: function (oResult) {
					that._clearModel();
					oRefreshModel.refresh();
					that.oRouter.navTo("Home");
					
				},
				error: function (oError) {

				}
			});
		},

		_clearModel: function () {
			this.getView().getModel("rule").setData({});
			this.getView().getModel("Expression").setData([]);
			this.getView().getModel("Change").setData({
				"mode": "create"
			});
			this.getView().getModel("advancedrule").setData({
				"enabled": false
			});
		},

		_onRuleCancel: function () {
			this._clearModel();
			this.oRouter.navTo("Home");
		},

		formatValueFieldSelectVisibility: function (sValue) {
			if (sValue && sValue.length > 0 && sValue !== "CUSTOM_VALUE") {
				return true;
			} else {
				return false;
			}
		},

		formatValueFieldCustomVisibility: function (sValue) {
			if (sValue && sValue.length > 0 && sValue === "CUSTOM_VALUE") {
				return true;
			} else {
				return false;
			}
		},

		_onAdvancedRuleMode: function (oEvent) {
			this.getView().getModel("advancedrule").setProperty("/enabled", oEvent.getParameter("state"));
		}
	});

});