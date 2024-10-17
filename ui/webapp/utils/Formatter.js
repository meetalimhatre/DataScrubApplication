sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		
		formatShellBarInitials: function(sValue){
			if(sValue && sValue.length && sValue.indexOf(".")>0){
				return (sValue.split('.')[0][0] + sValue.split('.')[1][0]).toString().toUpperCase();	
			}
			else{
				return 'DS';
			}
		},

		formatDateUTCtoLocale: function (dDate) {
			if (dDate) {
				return dDate.getUTCFullYear() + "/" + (dDate.getUTCMonth() + 1) + "/" + dDate.getUTCDate();
			}
			return dDate;

		},

		formatSamplingAssignButtonVisibility: function (sValue1, sValue2) {
			if (sValue2) {
				if (sValue1 === 'READY_FOR_SAMPLING') {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		formatSetStatusVisibility: function (sValue1, sValue2, sValue3) {

			if (sValue2 === 'DS_COMPLETE') {
				return false;
			} else {

				if (sValue1 === 'REVIEWER_INCLUDED' || sValue1 === 'REVIEWER_EXCLUDED') {
					return false;
				}

				/*if (sValue3 === 'DSAdmin') {
					return true;
				}*/

				if ((sValue3 === 'Scrubber') && (sValue1 === undefined || sValue1 === null || sValue1 === '' || sValue1 === 'SCRUBBER_IN_DRAFT' || sValue1 ===
						'SENT_BACK_FOR_REVIEW')) {
					return true;
				} else if ((sValue3 === 'Reviewer') && (sValue1 === 'SCRUBBER_INCLUDED' || sValue1 === 'SCRUBBER_EXCLUDED' || sValue1 ===
						'REVIEWER_IN_DRAFT')) {
					return true;
				} else {
					return false;
				}
			}

		},

		formatTestingCommentsActionVisibility: function (sValue1, sValue2) {
			
			if (sValue1 !== 'DS_COMPLETE' && (sValue2 === 'Scrubber' || sValue2 === 'Reviewer') ) {
				return true;
			} else {
				return false;
			}

		},
		
		formatTestingCommentsEditVisibility: function (sValue1) {
			if (sValue1 !== 'DS_COMPLETE') {
				return true;
			} else {
				return false;
			}
		},

		formatScrubberStatusVisibility: function (sValue) {
			if (sValue === undefined || sValue === '' || sValue === 'SCRUBBER_IN_DRAFT' || sValue === 'SENT_BACK_FOR_REVIEW') {
				return true;
			} else {
				return false;
			}

		},

		formatReviewerStatusVisibility: function (sValue) {
			if (sValue === 'SCRUBBER_INCLUDED' || sValue === 'SCRUBBER_EXCLUDED' || sValue === 'REVIEWER_IN_DRAFT') {
				return true;
			} else {
				return false;
			}

		},

		formatSetToCompleteVisibility: function (sValue1, sValue2) {
			if (sValue2 === true && sValue1 !== 'DS_COMPLETE') {
				return true;
			} else {
				return false;
			}
		},

		formatAmountDisplay: function (sValue) {
			if (sValue) {
				return sValue.toString();
			} else {
				return "";
			}
		},

		formatFractionDigitFromValue: function (sValue) {
			var sNumber;
			if (isNaN(sValue)) {
				sNumber = sValue;
			} else {
				sNumber = Number(sValue).toFixed(2);
			}
			return sNumber;

		},
		
		formatReportState: function(sValue){
			if(sValue === 'SCRUBBER_INCLUDED' || sValue === 'REVIEWER_INCLUDED'){
				return "Success";
			}
			else if(sValue === 'SCRUBBER_EXCLUDED' || sValue === 'REVIEWER_EXCLUDED'){
				return "Indication03";
			}
			else{
				return "None";
			}
		},
		
		formatDSState: function(sValue){
			if(sValue === 'DS_COMPLETE'){
				return "Success";
			}
			else if(sValue === 'PROCESSING'){
				return "Indication03";
			}
			else{
				return "None";
			}
		},
		
		formatItemState: function(sValue){
			if(sValue === 'INCLUDE'){
				return "Success";
			}
			else if(sValue === 'EXCLUDE'){
				return "Indication03";
			}
			else{
				return "None";
			}
		}
	};

});