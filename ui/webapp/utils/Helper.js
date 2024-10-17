sap.ui.define([
	"sap/m/MessageToast"
], function (MessageToast) {
	"use strict";
	return {
		doNavigate: function (oRouter, sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}

			oRouter.navTo(sRouteName, {
				context: sPath
			}, false);

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},

		saveProcessLog: function (oModel, payload) {
			oModel.create("/DS_PROCESS_LOGS", payload, {
				success: function () {},

				error: function () {

				}
			});
		},

		updateProcessStatus: function (oModel, payload, resolve, reject) {
			oModel.update("/DS_PROCESS_MANAGE('" + payload.PRC_ID + "')", payload, {
				success: function () {
					MessageToast.show("Process updated successfully.");		
					resolve();
				},
				error: function () {
					MessageToast.show("Process could not be updated.");			
					reject();
				},
				merge: false
			});
		},

		updateDispositionStatus: function (oModel, payload) {
			var sPath = "/DS_EXP_STATUS(PRC_ID=" + payload.PRC_ID + ",REPORT_ID='" + payload.REPORT_ID + "')";
			oModel.update(sPath, payload, {
				success: function () {
					oModel.refresh();
				},

				error: function () {

				},

				merge: false
			});
		},
		
		updateDispositionItemStatus: function (oModel, payload) {
			var sPath = "/DS_EXP_STATUS_ITEM(PRC_ID=" + payload.PRC_ID + ",REPORT_ID='" + payload.REPORT_ID + "',ALLOCATION_KEY='"+ payload.ALLOCATION_KEY + "')";
			oModel.update(sPath, payload, {
				success: function () {
					oModel.refresh();
				},

				error: function () {

				},

				merge: false
			});
		},
		
		createDispositionItemStatus: function (oModel, payload) {
			var sPath = "/DS_EXP_STATUS_ITEM";
			oModel.create(sPath, payload, {
				success: function () {
					oModel.refresh();
				},
				error: function () {

				}
			});
		},

		createDispositionStatus: function (oModel, payload) {
			oModel.create("/DS_EXP_STATUS", payload, {
				success: function () {
					oModel.refresh();
				},

				error: function () {

				}
			});
		},
		
		createManualDisposition: function (oModel, payload) {
			oModel.create("/DS_MANUAL_DISPOSITIONS", payload, {
				success: function () {
					oModel.refresh();
				},

				error: function () {

				}
			});
		},
		
		updateManualDisposition: function (oModel, payload, sPath) {
			oModel.update(sPath, payload, {
				success: function () {
					oModel.refresh();
				},

				error: function () {

				}
			});
		}
		
		
	};
});