"use strict";

$.import("xsjs", "session");
var SESSIONINFO = $.xsjs.session;

function DeleteConfiguration(param) {
var after = param.beforeTableName;
	var Cfg = "select CONFIGURATION_NAME from \""+after+"\"";
	var Pstmt = param.connection.prepareStatement(Cfg);
	var Row = SESSIONINFO.recordSetToJSON(Pstmt.executeQuery(), "Details");
	var Config_name = Row.Details[0].CONFIGURATION_NAME;
	
  	var Pstmt = param.connection.prepareStatement('Call DELETE_CONFIG(?)');
  	Pstmt.setString(1,Config_name.toString());
    var Status = Pstmt.executeQuery();
	
}