sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (Controller, Fragment, JSONModel, MessageToast, SimpleType, ValidateException) {
	"use strict";

	return Controller.extend("com.ng.admin.securityui.controller.Home", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._initializeEntryModels();
		},

		_initializeEntryModels: function () {
			var entryModel;
			entryModel = new JSONModel();
			this.getView().setModel(entryModel, "user");

			entryModel = new JSONModel();
			entryModel.loadData("/datascrub/whoAmI", null, false);
			this.getView().setModel(entryModel, "user");

			entryModel = new JSONModel();
			entryModel.setData({
				"mode": "create"
			});
			this.getView().setModel(entryModel, "change");

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

					if (entryType === "DS_USERS") {
						sap.ui.getCore().getMessageManager().registerObject(sap.ui.core.Fragment.byId("UserCreate", "emailInput"), true);
					}
					oDialog.open();
				});
			}

		},


		_onAddUser: function () {
			this._showCreateDialog("com.ng.admin.securityui.fragments.UserCreate");
		},


		_handleCreateConfigurationEntries: function (oPayload, sEntityName, resolve, reject) {
			var oModel = this.getView().getModel();
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
			var oModel = this.getView().getModel();

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
			var oModel = this.getView().getModel();

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
			} 

			var sMode = this.getView().getModel("change").getData().mode;
			var changePromise, i, createPayload, deletePayload;

			if (sMode === 'edit') {

				if (sLocalModelName === 'user') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleUpdateConfigurationEntries(payload, sUpdateEntityPath, resolve, reject);
					});
				} 

			} else {

				if (sLocalModelName === 'user') {
					changePromise = new Promise(function (resolve, reject) {
						that._handleCreateConfigurationEntries(payload, sCreateEntityPath, resolve, reject);
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

		_handleMessage: function (mCategory) {
			if (mCategory === 'LOAD_TA_SUCCESS') {
				MessageToast.show("Configuration Load Successful");
			} else if (mCategory === 'LOAD_TA_ERROR') {
				MessageToast.show("Configuration Load Failed");
			}
		},

		_refreshModel: function(oEvent){
			oEvent.getSource().getParent().getParent().getBinding("items").refresh();
		},

		_onEditUser: function (oEvent) {
			this._onAddUser();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();
			this.getView().getModel("user").setData(oBindingObject);

			this.getView().getModel("change").setData({
				"mode": "edit"
			});
		},

		_onDeleteUser: function (oEvent) {
			var oModel = this.getView().getModel();
			var oBindingObject = oEvent.getSource().getBindingContext().getObject();

			var sPath = "/DS_USERS('" + oBindingObject.EMAIL + "')";

			oModel.remove(sPath, {
				success: function () {},
				error: function () {}
			});

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
					name: "com.ng.admin.securityui.fragments.UserPopover",
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