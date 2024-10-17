"use strict";

$.import("xsjs", "session");
var SESSIONINFO = $.xsjs.session;

function Initiate_Process(param) {
	// exit odata create and replace with this custom function
	// 'after' The name of a temporary table with the single entry after the operation create
	var after = param.afterTableName;
	// Get next process id (last id+1)
	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"";
	var Pstmt = param.connection.prepareStatement(prc);
	//	var userinfo = SESSIONINFO.fillSessionInfo();
	var Process_ID = SESSIONINFO.recordSetToJSON(Pstmt.executeQuery(), "Details");
	var prc_id = Process_ID.Details[0].PRC_ID + 1;

	// Set up insert to CDS_DS.T_DS_PROCESSES table
	var insert_string = "insert into \"CDS_DS.T_DS_PROCESSES\" values(?,?,?,?,?,?,?,?,?,?,?,?)";
	var pStmt = param.connection.prepareStatement(insert_string);

	var pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");
	var Process_Details = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	var now = new Date();
	var status_id;
	var AssignUser;
	var Owner;

	// 1-5 are unmodified from default odata create
	pStmt.setString(1, prc_id.toString());
	pStmt.setString(2, Process_Details.Details[0].DATA_SCRUB_NAME.toString());
	pStmt.setString(3, Process_Details.Details[0].DATA_SCRUB_DESC.toString());
	pStmt.setString(4, Process_Details.Details[0].COMPANY_CODE.toString());
	pStmt.setString(5, Process_Details.Details[0].START_DATE.toString());
	pStmt.setString(6, Process_Details.Details[0].END_DATE.toString());

	status_id = Process_Details.Details[0].STATUS_ID;
	if (Process_Details.Details[0].STATUS_ID == "") {
		var initial = 0;
		status_id = "PROCESSING";
	} else {
		status_id = Process_Details.Details[0].STATUS_ID.toString();
	};

	if (Process_Details.Details[0].ASSIGNUSER == null) {
		var initial = "";
		AssignUser = initial.toString();
	} else {
		AssignUser = Process_Details.Details[0].ASSIGNUSER.toString();
	};
	if (Process_Details.Details[0].OWNER == null) {
		var initial = "";
		Owner = initial.toString();
	} else {
		Owner = Process_Details.Details[0].OWNER.toString();
	};

	// 7-9 modified
	pStmt.setString(7, status_id);
	pStmt.setString(8, now.toJSON().toString());
	pStmt.setString(9, Owner);
	// 10-11 unmodified
	pStmt.setString(10, Process_Details.Details[0].CONFIGURATION_NAME.toString());
	pStmt.setString(11, Process_Details.Details[0].USER_GROUP.toString());
	pStmt.setString(12, Process_Details.Details[0].ITEM_SET.toString());

	// Insert to CDS_DS.T_DS_PROCESSES
	var result = pStmt.executeQuery();

	pStmt.close();

	// Clear 'after' table
	pStmt = param.connection.prepareStatement("TRUNCATE TABLE \"" + after + "\"");
	pStmt.executeUpdate();
	pStmt.close();

	// Set up insert to 'after' table with same info collected previously
	var insert_string = "insert into  \"" + after + "\" values(?,?,?,?,?,?,?,?,?,?,?,?)";
	var pStmt = param.connection.prepareStatement(insert_string);

	pStmt.setString(1, prc_id.toString());
	pStmt.setString(2, Process_Details.Details[0].DATA_SCRUB_NAME.toString());
	pStmt.setString(3, Process_Details.Details[0].DATA_SCRUB_DESC.toString());
	pStmt.setString(4, Process_Details.Details[0].COMPANY_CODE.toString());
	pStmt.setString(5, Process_Details.Details[0].START_DATE.toString());
	pStmt.setString(6, Process_Details.Details[0].END_DATE.toString());
	pStmt.setString(7, status_id);
	pStmt.setString(8, now.toJSON().toString());
	pStmt.setString(9, Owner);
	pStmt.setString(10, Process_Details.Details[0].CONFIGURATION_NAME.toString());
	pStmt.setString(11, Process_Details.Details[0].USER_GROUP.toString());
	pStmt.setString(12, Process_Details.Details[0].ITEM_SET.toString());

	var result = pStmt.executeQuery();
	pStmt.close();

	// Call other procedures

	// ad_dispositions_for_process	
	var proc_call = "CALL LOAD_DISPOSITIONS_FOR_PROCESS(?)"
	var stmt_proc = param.connection.prepareStatement(proc_call);
	stmt_proc.setString(1, prc_id.toString());
	var result = stmt_proc.executeQuery();
	stmt_proc.close();

	//Rule Stoppage Check this is handled inside the load_dispositions_for_process
	//	var rule_proc_call = "CALL LOAD_DISPOSITIONS_FOR_RULES(?)"
	//	var rule_stmt_proc = param.connection.prepareStatement(rule_proc_call);
	//	rule_stmt_proc.setString(1, prc_id.toString());
	// var result1 = rule_stmt_proc.executeQuery();
	// rule_stmt_proc.close();

	//Update the Process Table 
	//updateProcessStatus(prc_id);
	/*var update_string = 'UPDATE  "CDS_DS.T_DS_PROCESSES" SET STATUS_ID=? WHERE PRC_ID=?';
	pStmt = param.connection.prepareStatement(update_string);
	pStmt.setString(1, "READY_FOR_SAMPLING");
	pStmt.setString(2, prc_id.toString());
	pStmt.executeQuery();*/

}

function create_log_id(param) {
	var after = param.afterTableName;
	//	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"" ;
	var pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");
	//	var	pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");	
	var log = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	var uuid = create_UUID();
	var insert_string =
		"insert into \"CDS_DS.T_PROCESS_LOGS\"(LOG_ID,PRC_ID,TEXT,USER_ID,REPORT_ID,CREATED_TIME,SHORT_DESCRIPTION) values(?,?,?,?,?,?,?)";
	//	var	pStmt = param.connection.prepareStatement("insert into \"CDS_DS.T_DS_PROCESSES\"values(" + prc_id + ")");
	var pStmt = param.connection.prepareStatement(insert_string);
	pStmt.setString(1, uuid.toString());
	pStmt.setString(2, log.Details[0].PRC_ID.toString());

	pStmt.setClob(3, log.Details[0].TEXT.toString());
	pStmt.setString(4, log.Details[0].USER_ID.toString());
	pStmt.setString(5, log.Details[0].REPORT_ID.toString());

	var now = new Date();
	pStmt.setString(6, now.toJSON().toString());
	pStmt.setString(7, log.Details[0].SHORT_DESCRIPTION.toString());

	var result = pStmt.executeQuery();
	pStmt.close();
}

function create_allocation_code(param) {
	var after = param.afterTableName;
	//	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"" ;
	var pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");
	//	var	pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");	
	var log = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	//var uuid = create_UUID();
	var insert_string =
		"upsert  \"CDS_DS.T_ALLOCATION_CODES\"(ALLOCATION_CODE,ALLOCATED_COMPANY_CODE,FISCPER,DATE_OF_ENTRY) values(?,?,?,?) WITH PRIMARY KEY";
	//	var	pStmt = param.connection.prepareStatement("insert into \"CDS_DS.T_DS_PROCESSES\"values(" + prc_id + ")");
	var pStmt = param.connection.prepareStatement(insert_string);

	pStmt.setString(1, log.Details[0].ALLOCATION_CODE.toString());
	pStmt.setString(2, log.Details[0].ALLOCATED_COMPANY_CODE.toString());
	pStmt.setString(3, log.Details[0].FISCPER.toString());
	pStmt.setString(4, log.Details[0].DATE_OF_ENTRY.toString());


	var result = pStmt.executeQuery();
	pStmt.close();
	
	
}

function create_emp_band(param) {
	var after = param.afterTableName;
	//	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"" ;
	var pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");
	//	var	pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");	
	var log = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	//var uuid = create_UUID();
	var insert_string =
		"upsert  \"CDS_DS.T_EMP_BAND\"(PERNR,AEDTM,BAND_LEVEL,STEXT) values(?,?,?,?) WITH PRIMARY KEY";
	//	var	pStmt = param.connection.prepareStatement("insert into \"CDS_DS.T_DS_PROCESSES\"values(" + prc_id + ")");
	var pStmt = param.connection.prepareStatement(insert_string);

	pStmt.setString(1, log.Details[0].PERNR.toString());
	pStmt.setString(2, log.Details[0].AEDTM.toString());
	pStmt.setString(3, log.Details[0].BAND_LEVEL.toString());
	pStmt.setString(4, log.Details[0].STEXT.toString());


	var result = pStmt.executeQuery();
	pStmt.close();
	
	
}

function create_emp_order(param) {
	var after = param.afterTableName;
	//	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"" ;
	var pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");
	//	var	pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");	
	var log = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	//var uuid = create_UUID();
	var insert_string =
		"upsert  \"CDS_DS.T_EMP_ORDER\"(PERNR,BEGDA,ENDDA,AUFNR,KTEXT,VORNR,AEDTM,PROZT) values(?,?,?,?,?,?,?,?) WITH PRIMARY KEY";
	//	var	pStmt = param.connection.prepareStatement("insert into \"CDS_DS.T_DS_PROCESSES\"values(" + prc_id + ")");
	var pStmt = param.connection.prepareStatement(insert_string);

	pStmt.setString(1, log.Details[0].PERNR.toString());
	pStmt.setString(2, log.Details[0].BEGDA.toString());
	pStmt.setString(3, log.Details[0].ENDDA.toString());
	pStmt.setString(4, log.Details[0].AUFNR.toString());
	pStmt.setString(5, log.Details[0].KTEXT.toString());
	pStmt.setString(6, log.Details[0].VORNR.toString());
	pStmt.setString(7, log.Details[0].AEDTM.toString());
	pStmt.setString(8, log.Details[0].PROZT.toString());


	var result = pStmt.executeQuery();
	pStmt.close();
	
	
}

function create_disposition(param) {
	var after = param.afterTableName;
	var created_by = '';
	//	var prc = "select max(prc_id) as prc_id from \"CDS_DS.T_DS_PROCESSES\"" ;
	var pStmt_select = param.connection.prepareStatement(
		`select REPORT_ID,PRC_ID,ITEM,DISPOSITION_REASON,DISPOSITION_ENTITY,
	CREATED_BY,
	LAST_CHANGED_BY,
	SAMPLED_FLAG,ALLOCATION_KEY,REVIEWER_COMMENTS,SCRUBBER_COMMENTS from "` +
		after + `"`);
	//	var	pStmt_select = param.connection.prepareStatement("select * from \"" + after + "\"");	
	var log = SESSIONINFO.recordSetToJSON(pStmt_select.executeQuery(), "Details");

	var session = SESSIONINFO.getSessionInfo();
	created_by = session.UserName;
	var insert_string =
		`insert into "CDS_DS.T_MANUAL_DISPOSITIONS"(REPORT_ID,PRC_ID,ITEM,DISPOSITION_REASON,DISPOSITION_ENTITY,
	CREATED_BY,
	LAST_CHANGED_BY,
	SAMPLED_FLAG,ALLOCATION_KEY,REVIEWER_COMMENTS,SCRUBBER_COMMENTS) values(?,?,?,?,?,?,?,?,?,?,?)`;
	//	var	pStmt = param.connection.prepareStatement("insert into \"CDS_DS.T_DS_PROCESSES\"values(" + prc_id + ")");
	var pStmt = param.connection.prepareStatement(insert_string);
	//	pStmt.setString(3, uuid.toString());
	pStmt.setString(1, log.Details[0].REPORT_ID.toString());

	//	pStmt.setString(2, log.Details[0].ALLOCATION_KEY.toString());
	pStmt.setString(3, log.Details[0].ITEM.toString());
	pStmt.setString(2, log.Details[0].PRC_ID.toString());
	pStmt.setString(4, log.Details[0].DISPOSITION_REASON.toString());
	pStmt.setString(5, log.Details[0].DISPOSITION_ENTITY.toString());

	
	//pStmt.setString(6, log.Details[0].CREATED_BY.toString());
	/*if (typeof created_by === 'undefined') {
		pStmt.setString(6, '');
	} else {
		pStmt.setString(6, created_by.toString());
	};*/
	pStmt.setString(6, log.Details[0].CREATED_BY.toString());
	pStmt.setString(7, log.Details[0].LAST_CHANGED_BY.toString());
	//	pStmt.setString(11, log.Details[0].DISPOSITION_TYPE.toString());
	pStmt.setString(8, log.Details[0].SAMPLED_FLAG.toString());
		pStmt.setString(9, log.Details[0].ALLOCATION_KEY.toString());
	pStmt.setString(10, log.Details[0].REVIEWER_COMMENTS.toString());
	pStmt.setString(11, log.Details[0].SCRUBBER_COMMENTS.toString());
	var result = pStmt.executeQuery();
	pStmt.close();

}

function create_UUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

function updateProcessStatus(processId) {
	var connection = $.hdb.getConnection();
	connection.executeUpdate('UPDATE  "CDS_DS.T_DS_PROCESSES" SET STATUS_ID=? WHERE PRC_ID=?', "READY_FOR_SCRUBBER_REVIEW", processId);
	connection.commit();
}