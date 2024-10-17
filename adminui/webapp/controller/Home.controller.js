sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
], function (Controller, Fragment, JSONModel, MessageToast, SimpleType, ValidateException) {
	"use strict";

	return Controller.extend("com.ng.admin.adminui.controller.Home", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._initializeEntryModels();

			Array.prototype.diff = function (a) {
				return this.filter(function (i) {
					return a.indexOf(i) < 0;
				});
			};

		},

		_initializeEntryModels: function () {

			var entryModel;

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "configuration");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "keyword");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "ruleset");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "user");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "usergroup");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "checklist");

			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "checklistgroup");

			entryModel = new JSONModel();
			entryModel.loadData("/datascrub/whoAmI", null, false);
			this.getView().setModel(entryModel, "user");

			entryModel = new JSONModel();
			entryModel.setData({
				"mode": "create"
			});
			this.getView().setModel(entryModel, "change");

		},

		_onNavToNewRule: function () {
			this.oRouter.navTo("CreateRule", {});
		},

		_showCreateDialog: function (sFragmentName) {
			var oView = this.getView();
			var fragmentId = sFragmentName.split(".")[5],
				dialogId = fragmentId + "Dialog";

			if (sap.ui.core.Fragment.byId(fragmentId, dialogId)) {
				var oExistingDialog = sap.ui.core.Fragment.byId(fragmentId, dialogId);
				oExistingDialog.open();
			} else {
				Fragment.load({
					id: fragmentId,
					name: sFragmentName,
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);

					var entryType = oDialog.getCustomData()[0].getValue();

					if (entryType === "DS_ENTITY_DETAILS") {
						//workaround
						var oMultiInput = oDialog.getContent()[0].getItems()[0].getContent()[3];
						var fValidator = function (args) {
							window.setTimeout(function () {
								args.asyncCallback(new sap.m.Token({
									text: args.text
								}));
							}, 500);
							return sap.m.MultiInput.WaitForAsyncValidation;
						};
						oMultiInput.addValidator(fValidator);
					} else if (entryType === "DS_USERS") {
						sap.ui.getCore().getMessageManager().registerObject(sap.ui.core.Fragment.byId("UserCreate", "emailInput"), true);
					}
					oDialog.open();
				});
			}

		},

		_onAddConfiguration: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.ConfigurationCreate");
		},

		_onAddKeyword: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.KeywordCreate");
		},

		_onAddRuleset: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.RulesetCreate");
		},

		_onAddUser: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.UserCreate");
		},

		_onAddUsergroup: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.UsergroupCreate");
		},

		_onAddChecklist: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.ChecklistCreate");
		},

		_onAddChecklistGroup: function () {
			this._showCreateDialog("com.ng.admin.adminui.fragments.ChecklistGroupCreate");
		},

		_onEditConfiguration: function (oEvent) {
			this._onAddConfiguration();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var aTokens = oEvent.getSource().getParent().getCells()[1].getTokens().map(function (v) {
				return v.getText();
			});

			var confPayload = {
				"CONFIGURATION_NAME": oBindingObject.CONFIGURATION_NAME,
				"ENTITY_GROUPS": aTokens,
				"RULESET_NAME": oBindingObject.RULESET_NAME
			};

			this.getView().getModel("configuration").setData(confPayload);
			this.getView().getModel("change").setData({
				"mode": "edit",
				"oldTokens": aTokens,
				"oldRuleset": oBindingObject.RULESET_NAME
			});
		},

		_onEditUsergroup: function (oEvent) {
			this._onAddUsergroup();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var aTokens = oEvent.getSource().getParent().getCells()[1].getTokens().map(function (v) {
				return v.getText();
			});

			var usergroupPayload = {
				"USER_GROUP": oBindingObject.USER_GROUP,
				"USERS": aTokens
			};

			this.getView().getModel("usergroup").setData(usergroupPayload);
			this.getView().getModel("change").setData({
				"mode": "edit",
				"oldTokens": aTokens
			});

		},

		_onEditKeyword: function (oEvent) {
			this._onAddKeyword();

			var i, oToken;
			var oMultiInput = sap.ui.core.Fragment.byId("KeywordCreate", "KeywordMultiInput");
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var aTokens = oEvent.getSource().getParent().getCells()[1].getTokens().map(function (v) {
				return v.getText();
			});

			var keywordPayload = {
				"ENTITY_GROUP": oBindingObject.ENTITY_GROUP
			};

			oMultiInput.removeAllTokens();
			for (i = 0; i < aTokens.length; i++) {
				oToken = new sap.m.Token({
					text: aTokens[i],
					editable: true
				});
				oMultiInput.addToken(oToken);
			}

			this.getView().getModel("keyword").setData(keywordPayload);
			this.getView().getModel("change").setData({
				"mode": "edit",
				"oldTokens": aTokens
			});

		},

		_onEditRuleset: function (oEvent) {
			this._onAddRuleset();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var aTokens = oEvent.getSource().getParent().getCells()[1].getTokens().map(function (v) {
				return v.getText();
			});
			var rulesetPayload = {
				"RULESET_NAME": oBindingObject.RULESET_NAME,
				"RULE_NAMES": aTokens
			};
			this.getView().getModel("ruleset").setData(rulesetPayload);
			this.getView().getModel("change").setData({
				"mode": "edit",
				"oldTokens": aTokens
			});

		},

		_onEditChecklistSet: function (oEvent) {
			this._onAddChecklistGroup();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			var aTokens = oEvent.getSource().getParent().getCells()[1].getTokens().map(function (v) {
				return v.getText();
			});
			var checklistSetPayload = {
				"ITEM_SET": oBindingObject.ITEM_SET,
				"ITEMS": aTokens
			};
			this.getView().getModel("checklistgroup").setData(checklistSetPayload);
			this.getView().getModel("change").setData({
				"mode": "edit",
				"oldTokens": aTokens
			});

		},

		_handleCreateConfigurationEntries: function (oPayload, sEntityName, resolve, reject) {
			var oModel = this.getView().getModel("adminModel");
			oModel.create("/" + sEntityName, oPayload, {
				success: function (oResult) {
					resolve({
						type: "SUCCESS",
						payload: oResult,
						message: "Entry create successful."
					});
				},
				error: function (oError) {
					resolve({
						type: "ERROR",
						payload: oError,
						message: "Entry could not be created."
					});
				}
			});
		},

		_handleUpdateConfigurationEntries: function (oPayload, sEntityName, resolve, reject) {
			var oModel = this.getView().getModel("adminModel");

			oModel.update("/" + sEntityName, oPayload, {
				success: function (oResult) {
					resolve({
						type: "SUCCESS",
						payload: oResult,
						message: "Entry update successful."
					});
				},
				error: function (oError) {
					resolve({
						type: "ERROR",
						payload: oError,
						message: "Entry could not be updated."
					});
				}
			});
		},

		_handleDeleteConfigurationEntries: function (sEntityName, resolve, reject) {
			var oModel = this.getView().getModel("adminModel");

			oModel.remove("/" + sEntityName, {
				success: function (oResult) {
					resolve({
						type: "SUCCESS",
						payload: oResult,
						message: "Entry delete successful."
					});
				},
				error: function (oError) {
					resolve({
						type: "ERROR",
						payload: oError,
						message: "Entry could not be deleted."
					});
				}
			});

		},

		_clearModel: function (sLocalModel) {

			this.getView().getModel(sLocalModel).setData({});

			this.getView().getModel("change").setData({
				"mode": "create"
			});

			if (sLocalModel === 'keyword') {
				var oMultiInput = sap.ui.core.Fragment.byId("KeywordCreate", "KeywordMultiInput");
				oMultiInput.removeAllTokens();
			}

		},

		_handleUserDialogSubmit: function (oEvent) {
			var oDialog = oEvent.getSource().getParent(),
				oModel = this.getView().getModel(),
				that = this,
				pModel, payload;

			var sLocalEntityName = oDialog.getCustomData()[0].getValue(),
				sLocalModelName = oDialog.getCustomData()[1].getValue(),
				sCreateEntityPath, sUpdateEntityPath, sDeleteEntityPath;

			if (sLocalModelName === 'user') {
				pModel = this.getView().getModel("user");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
				sUpdateEntityPath = sLocalEntityName + "('" + payload.EMAIL + "')";
			} else if (sLocalModelName === 'usergroup') {
				pModel = this.getView().getModel("usergroup");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
			} else if (sLocalModelName === 'ruleset') {
				pModel = this.getView().getModel("ruleset");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
			} else if (sLocalModelName === 'keyword') {
				pModel = this.getView().getModel("keyword");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
			} else if (sLocalModelName === 'configuration') {
				pModel = this.getView().getModel("configuration");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
			} else if (sLocalModelName === 'checklist') {
				pModel = this.getView().getModel("checklist");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
				sUpdateEntityPath = sLocalEntityName + "('" + payload.ITEM + "')";
			} else if (sLocalModelName === 'checklistgroup') {
				pModel = this.getView().getModel("checklistgroup");
				payload = pModel.getData();
				sCreateEntityPath = sLocalEntityName;
				// sUpdateEntityPath = sLocalEntityName + "('" + payload.ITEM + "')";
			}

			var sMode = this.getView().getModel("change").getData().mode;
			var changePromise, i, createPayload, deletePayload;

			if (sMode === 'edit') {

				if (sLocalModelName === 'user') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleUpdateConfigurationEntries(payload, sUpdateEntityPath, resolve, reject);
					});
				} else if (sLocalModelName === 'checklist') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleUpdateConfigurationEntries(payload, sUpdateEntityPath, resolve, reject);
					});
				} else if (sLocalModelName === 'usergroup') {

					changePromise = new Promise(function (resolve, reject) {
						var oldTokens = that.getView().getModel("change").getData().oldTokens,
							newTokens = payload.USERS,
							addedTokens = newTokens.diff(oldTokens),
							deletedTokens = oldTokens.diff(newTokens);

						for (i = 0; i < addedTokens.length; i++) {
							createPayload = {
								"USER_GROUP": payload.USER_GROUP,
								"EMAIL": addedTokens[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

						for (i = 0; i < deletedTokens.length; i++) {
							deletePayload = {
								"USER_GROUP": payload.USER_GROUP,
								"USER": deletedTokens[i]
							};
							sDeleteEntityPath = sLocalEntityName + "(USER_GROUP='" + deletePayload.USER_GROUP + "',EMAIL='" + deletePayload.USER + "')";
							that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
						}
					});

				} else if (sLocalModelName === 'ruleset') {

					changePromise = new Promise(function (resolve, reject) {
						var oldTokens = that.getView().getModel("change").getData().oldTokens,
							newTokens = payload.RULE_NAMES,
							addedTokens = newTokens.diff(oldTokens),
							deletedTokens = oldTokens.diff(newTokens);

						for (i = 0; i < addedTokens.length; i++) {
							createPayload = {
								"RULESET_NAME": payload.RULESET_NAME,
								"RULE_NAME": addedTokens[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

						for (i = 0; i < deletedTokens.length; i++) {
							deletePayload = {
								"RULESET_NAME": payload.RULESET_NAME,
								"RULE_NAME": deletedTokens[i]
							};
							sDeleteEntityPath = sLocalEntityName + "(RULESET_NAME='" + deletePayload.RULESET_NAME + "',RULE_NAME='" + deletePayload.RULE_NAME +
								"')";
							that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
						}
					});

				} else if (sLocalModelName === 'checklistgroup') {

					changePromise = new Promise(function (resolve, reject) {
						var oldTokens = that.getView().getModel("change").getData().oldTokens,
							newTokens = payload.ITEMS,
							addedTokens = newTokens.diff(oldTokens),
							deletedTokens = oldTokens.diff(newTokens);

						for (i = 0; i < addedTokens.length; i++) {
							createPayload = {
								"ITEM_SET": payload.ITEM_SET,
								"ITEM": addedTokens[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

						for (i = 0; i < deletedTokens.length; i++) {
							deletePayload = {
								"ITEM_SET": payload.ITEM_SET,
								"ITEM": deletedTokens[i]
							};
							sDeleteEntityPath = sLocalEntityName + "(ITEM_SET='" + deletePayload.ITEM_SET + "',ITEM='" + deletePayload.ITEM +
								"')";
							that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
						}
					});

				} else if (sLocalModelName === 'keyword') {

					changePromise = new Promise(function (resolve, reject) {

						var oMultiInput = sap.ui.core.Fragment.byId("KeywordCreate", "KeywordMultiInput"),
							newTokens = oMultiInput.getTokens().map(function (v) {
								return v.getText();
							}),
							oldTokens = that.getView().getModel("change").getData().oldTokens,

							addedTokens = newTokens.diff(oldTokens),
							deletedTokens = oldTokens.diff(newTokens);

						for (i = 0; i < addedTokens.length; i++) {
							createPayload = {
								"ENTITY_GROUP": payload.ENTITY_GROUP,
								"ENTITY_NAME": addedTokens[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

						for (i = 0; i < deletedTokens.length; i++) {
							deletePayload = {
								"ENTITY_GROUP": payload.ENTITY_GROUP,
								"ENTITY_NAME": deletedTokens[i]
							};
							sDeleteEntityPath = sLocalEntityName + "(ENTITY_GROUP='" + deletePayload.ENTITY_GROUP + "',ENTITY_NAME='" + deletePayload.ENTITY_NAME +
								"')";
							that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
						}
					});

				} else if (sLocalModelName === 'configuration') {

					changePromise = new Promise(function (resolve, reject) {
						var oldTokens = that.getView().getModel("change").getData().oldTokens,
							oldRuleset = that.getView().getModel("change").getData().oldRuleset,
							newTokens = payload.ENTITY_GROUPS,
							addedTokens = newTokens.diff(oldTokens),
							deletedTokens = oldTokens.diff(newTokens);

						if (oldRuleset === payload.RULESET_NAME) {
							for (i = 0; i < addedTokens.length; i++) {
								createPayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": payload.RULESET_NAME,
									"ENTITY_GROUP": addedTokens[i],
									"CONF_STATUS": "READY"
								};
								that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
							}

							for (i = 0; i < deletedTokens.length; i++) {
								deletePayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": oldRuleset,
									"ENTITY_GROUP": deletedTokens[i],
									"CONF_STATUS": "READY"
								};
								sDeleteEntityPath = sLocalEntityName + "(ENTITY_GROUP='" + deletePayload.ENTITY_GROUP +
									"',CONFIGURATION_NAME='" + deletePayload.CONFIGURATION_NAME +
									"',RULESET_NAME='" + deletePayload.RULESET_NAME + "')";
								that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
							}

							if (payload.ENTITY_GROUPS.length === 0) {
								createPayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": payload.RULESET_NAME,
									"ENTITY_GROUP": "",
									"CONF_STATUS": "DEPLOYED"
								};
								that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
							}

						} else {

							for (i = 0; i < oldTokens.length; i++) {
								deletePayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": oldRuleset,
									"ENTITY_GROUP": oldTokens[i],
									"CONF_STATUS": "READY"
								};
								sDeleteEntityPath = sLocalEntityName + "(ENTITY_GROUP='" + deletePayload.ENTITY_GROUP +
									"',CONFIGURATION_NAME='" + deletePayload.CONFIGURATION_NAME +
									"',RULESET_NAME='" + deletePayload.RULESET_NAME + "')";
								that._handleDeleteConfigurationEntries(sDeleteEntityPath, resolve, reject);
							}

							for (i = 0; i < newTokens.length; i++) {
								createPayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": payload.RULESET_NAME || "",
									"ENTITY_GROUP": newTokens[i],
									"CONF_STATUS": "READY"
								};
								that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
							}
						}

					});

				}

			} else {

				if (sLocalModelName === 'user') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleCreateConfigurationEntries(payload, sCreateEntityPath, resolve, reject);
					});
				} else if (sLocalModelName === 'checklist') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleCreateConfigurationEntries(payload, sCreateEntityPath, resolve, reject);
					});
				} else if (sLocalModelName === 'usergroup') {
					changePromise = new Promise(function (resolve, reject) {
						for (i = 0; i < payload.USERS.length; i++) {
							var userBindingPath = "/DS_USERS('" + payload.USERS[i] + "')";
							createPayload = {
								"USER_GROUP": payload.USER_GROUP,
								"EMAIL": payload.USERS[i],
								"USER": that.getView().getModel().getContext(userBindingPath).getObject().NAME,
								"DESC": "",
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}
					});
				} else if (sLocalModelName === 'checklistgroup') {
					changePromise = new Promise(function (resolve, reject) {
						for (i = 0; i < payload.ITEMS.length; i++) {
							var userBindingPath = "/DS_CHECKLIST('" + payload.ITEMS[i] + "')";
							createPayload = {
								"ITEM_SET": payload.ITEM_SET,
								"ITEM": payload.ITEMS[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}
					});
				} else if (sLocalModelName === 'ruleset') {
					changePromise = new Promise(function (resolve, reject) {

						for (i = 0; i < payload.RULE_NAMES.length; i++) {
							createPayload = {
								"RULESET_NAME": payload.RULESET_NAME,
								"RULE_NAME": payload.RULE_NAMES[i]
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}
					});
				} else if (sLocalModelName === 'keyword') {
					changePromise = new Promise(function (resolve, reject) {

						var oMultiInput = sap.ui.core.Fragment.byId("KeywordCreate", "KeywordMultiInput");
						payload.ENTITY_NAMES = oMultiInput.getTokens().map(function (v) {
							return v.getText();
						});

						for (i = 0; i < payload.ENTITY_NAMES.length; i++) {
							createPayload = {
								"ENTITY_GROUP": payload.ENTITY_GROUP,
								"ENTITY_NAME": payload.ENTITY_NAMES[i],
								"ENTITY_VARIATION": ""
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

					});
				} else if (sLocalModelName === 'configuration') {
					changePromise = new Promise(function (resolve, reject) {

						//Check if ENTITY GROUPS attached to the payload. The condition should fail in case no value provided

						if (!payload.ENTITY_GROUPS && !payload.RULESET_NAME) {
							MessageToast.show("At least provide one keyword group or functional ruleset");
							return;
						}
						

						if (payload.ENTITY_GROUPS && payload.ENTITY_GROUPS.length) {
							for (i = 0; i < payload.ENTITY_GROUPS.length; i++) {
								createPayload = {
									"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
									"RULESET_NAME": payload.RULESET_NAME || "",
									"ENTITY_GROUP": payload.ENTITY_GROUPS[i],
									"CONF_STATUS": "READY"
								};
								that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
							}
						} else {
							createPayload = {
								"CONFIGURATION_NAME": payload.CONFIGURATION_NAME,
								"RULESET_NAME": payload.RULESET_NAME,
								"ENTITY_GROUP": "",
								"CONF_STATUS": "DEPLOYED"
							};
							that._handleCreateConfigurationEntries(createPayload, sCreateEntityPath, resolve, reject);
						}

					});
				}

			}

			changePromise.then(function (oValue) {
				oDialog.close();
				oModel.refresh();
				if (oValue.message) {
					that._showUserMessage(oValue.message);
				}
				that._clearModel(sLocalModelName);

			});

		},

		_showUserMessage: function (sMessage) {
			MessageToast.show(sMessage);
		},

		_handleEntryDialogCancel: function (oEvent) {
			var sModelName = oEvent.getSource().getParent().getCustomData()[1].getValue();
			this._clearModel(sModelName);
			oEvent.getSource().getParent().close();
		},

		formatDeployConfigurationVisibility: function (sValue) {
			if (sValue === 'READY') {
				return true;
			} else {
				return false;
			}
		},

		_handleTAConfigLoad: function (oEvent) {
			var sConfName = oEvent.getSource().getBindingContext().getObject().CONFIGURATION_NAME;
			var oModel = this.getView().getModel();
			var payload = {
				confName: sConfName
			};
			var that = this;

			$.ajax({
				type: 'POST',
				url: '/config/load_ta_configuration/' + sConfName,
				dataType: 'json',
				data: payload,
				success: function (data) {
					oModel.refresh();
					// that._updateConfigurationStatus(oEvent);
					that._handleMessage('LOAD_TA_SUCCESS');
				},
				error: function (xhr, type, exception) {
					that._handleMessage('LOAD_TA_ERROR');
				}
			});
		},

		_handleTAConfigUnload: function (oEvent) {

			var sConfName = oEvent.getSource().getBindingContext().getObject().CONFIGURATION_NAME;
			var oModel = this.getView().getModel();

			var payload = {
				confName: sConfName
			};
			var that = this;

			$.ajax({
				type: 'POST',
				url: '/config/unload_ta_configuration/' + sConfName,
				dataType: 'json',
				data: payload,
				success: function (data) {
					oModel.refresh();
					that._handleMessage('LOAD_TA_SUCCESS');
				},
				error: function (xhr, type, exception) {
					that._handleMessage('LOAD_TA_ERROR');
				}
			});
		},

		_handleMessage: function (mCategory) {

			if (mCategory === 'LOAD_TA_SUCCESS') {
				MessageToast.show("Configuration Load Successful");
			} else if (mCategory === 'LOAD_TA_ERROR') {
				MessageToast.show("Configuration Load Failed");
			}

		},


		_onDelete: function (oEvent) {
			var oModel = this.getView().getModel("adminModel"),
				oParentTableBinding = oEvent.getSource().getParent().getParent().getBinding("items"),
				entityName = oEvent.getSource().getCustomData()[0].getValue(),
				oBindingObject = oEvent.getSource().getBindingContext().getObject(),
				aTokens = [],
				sPaths = [],
				sPath,
				i;

			if (entityName === "DS_ENTITY_DETAILS") {
				aTokens = oEvent.getSource().getParent().getCells()[1].getTokens();
				for (i = 0; i < aTokens.length; i++) {
					var sEntityName = aTokens[i].getText();
					sPath = "/DS_ENTITY_DETAILS(ENTITY_GROUP='" + encodeURIComponent(oBindingObject.ENTITY_GROUP.trim()) + "',ENTITY_NAME='" +
						encodeURIComponent(sEntityName.trim()) + "')";

					sPaths.push(sPath);
				}
			} else if (entityName === "DS_RULES") {
				sPath = "/DS_RULES('" + encodeURIComponent(oBindingObject.RULE_NAME.trim()) + "')";
				sPaths.push(sPath);
			} else if (entityName === "DS_CHECKLIST") {
				sPath = "/DS_CHECKLIST('" + encodeURIComponent(oBindingObject.ITEM.trim()) + "')";
				sPaths.push(sPath);
			} else if (entityName === "DS_RULESET_DETAILS") {
				aTokens = oEvent.getSource().getParent().getCells()[1].getTokens();
				for (i = 0; i < aTokens.length; i++) {
					var sRuleName = aTokens[i].getText();
					sPath = "/DS_RULESET_DETAILS(RULESET_NAME='" + encodeURIComponent(oBindingObject.RULESET_NAME.trim()) + "',RULE_NAME='" +
						encodeURIComponent(sRuleName.trim()) + "')";

					sPaths.push(sPath);
				}
			} else if (entityName === "DS_USERGROUP_DETAILS") {
				aTokens = oEvent.getSource().getParent().getCells()[1].getTokens();
				for (i = 0; i < aTokens.length; i++) {
					var sUser = aTokens[i].getText();
					sPath = "/DS_USERGROUP_DETAILS(USER_GROUP='" + encodeURIComponent(oBindingObject.USER_GROUP.trim()) + "',EMAIL='" +
						encodeURIComponent(sUser.trim()) + "')";

					sPaths.push(sPath);
				}

			} else if (entityName === "DS_CHECKLIST_SET_DETAILS") {
				aTokens = oEvent.getSource().getParent().getCells()[1].getTokens();
				for (i = 0; i < aTokens.length; i++) {
					var sItem = aTokens[i].getText();
					sPath = "/DS_CHECKLIST_SET_DETAILS(ITEM_SET='" + encodeURIComponent(oBindingObject.ITEM_SET.trim()) + "',ITEM='" +
						encodeURIComponent(sItem.trim()) + "')";

					sPaths.push(sPath);
				}
			}

			for (i = 0; i < sPaths.length; i++) {
				var deletePromise = new Promise(function (resolve, reject) {
					oModel.remove(sPaths[i], {
						success: function () {
							resolve();
						},
						error: function () {
							reject();
						}
					});
				}).then(function () {
					oParentTableBinding.refresh();
				}).catch(function () {

				});

			}
		},

		_onEditChecklist: function (oEvent) {
			this._onAddChecklist();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			this.getView().getModel("checklist").setData(oBindingObject);

			this.getView().getModel("change").setData({
				"mode": "edit"
			});
		},

		_handleMenuItemSelected: function (oEvent) {
			// var oMenuItem = oEvent.getParameter("item");
			if (document.URL.indexOf("nationalgridprod") > 0) {
				sap.m.URLHelper.redirect("https://national-grid-nationalgridprod-prod-ui.cfapps.us10.hana.ondemand.com", true);
			} else {
				sap.m.URLHelper.redirect("https://national-grid-ec-cf-nonprod-org-dev-ui.cfapps.us10.hana.ondemand.com", true);
			}
		},

		_onEditRule: function (oEvent) {
			this.oRouter.navTo("EditRule", {
				mode: "edit",
				context: oEvent.getSource().getBindingContext().getObject().RULE_NAME
			}, false);

		},

		formatEntityGroupVisibility: function (sValue) {
			if (sValue === "") {
				return false;
			} else {
				return true;
			}
		},

		formatLastDeployed: function (sValue) {
			if (sValue) {
				return "Last Deployed on " + sValue.toUTCString();
			} else {
				return "";
			}
		},

		customEMailType: SimpleType.extend("email", {
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				return oValue;
			},
			validateValue: function (oValue) {
				// The following Regex is NOT a completely correct one and only used for demonstration purposes.
				// RFC 5322 cannot even checked by a Regex and the Regex for RFC 822 is very long and complex.
				var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!oValue.match(rexMail)) {
					throw new ValidateException("'" + oValue + "' is not a valid email address");
				}
			}
		}),
		
		formatShellBarInitials: function(sValue){
			if(sValue && sValue.length && sValue.indexOf(".")>0){
				return (sValue.split('.')[0][0] + sValue.split('.')[1][0]).toString().toUpperCase();	
			}
			else{
				return 'DS';
			}
		},
		
		_openUserPopover: function(oEvent){
			var oControl = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "com.ng.admin.adminui.fragments.UserPopover",
					controller: this
				}).then(function(pPopover) {
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
		}
	});
});