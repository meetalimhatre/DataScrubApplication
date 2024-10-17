"use strict";

$.import("xsjs", "session");
$.import("xsjs","CreateProcess");
var SESSIONINFO = $.xsjs.session;
var CreateProcess = $.xsjs.CreateProcess;

function InsertConfiguration(param)
{
	
	var after = param.afterTableName;
	var Cfg = "select * from \""+after+"\"";
	var Pstmt = param.connection.prepareStatement(Cfg);
	var Row = SESSIONINFO.recordSetToJSON(Pstmt.executeQuery(), "Details");
	
	var Config_name = Row.Details[0].CONFIGURATION_NAME;
	var Ruleset_name = Row.Details[0].RULESET_NAME;
	var Entity_Group = Row.Details[0].ENTITY_GROUP;
	var Conf_Status = Row.Details[0].CONF_STATUS;
	
	
  	var Pstmt = param.connection.prepareStatement('INSERT INTO "CDS_DS.T_CONFIGURATIONS"("CONFIGURATION_NAME","RULESET_NAME","ENTITY_GROUP", "CONF_STATUS") VALUES(?,?,?,?)');
  	Pstmt.setString(1,Config_name.toString());
  	Pstmt.setString(2,Ruleset_name.toString());
  	Pstmt.setString(3,Entity_Group.toString());
  	Pstmt.setString(4,Conf_Status.toString());
    var Configuration = Pstmt.executeQuery();
	
}

function InsertConcur(param)
{
	
	var after = param.afterTableName;
	var Cfg = "select * from \""+after+"\"";
	var Pstmt = param.connection.prepareStatement(Cfg);
	var Row = SESSIONINFO.recordSetToJSON(Pstmt.executeQuery(), "Details");
	
	 var EMPLOYEE_ID = Row.Details[0].EMPLOYEE_ID;
     var   EMPLOYEE_NAME = Row.Details[0].EMPLOYEE_NAME;        
     var   EMPLOYEE_COMPANY = Row.Details[0].EMPLOYEE_COMPANY;      
     var   REPORT_NAME = Row.Details[0].REPORT_NAME;           
     var   PURPOSE = Row.Details[0].PURPOSE;                
     var   SENT_FOR_PAYMENT = Row.Details[0].SENT_FOR_PAYMENT;     
     var   TOTAL_APPROVED_AMOUNT  = Row.Details[0].TOTAL_APPROVED_AMOUNT;
     var   PAYMENT_TYPE  = Row.Details[0].PAYMENT_TYPE;        
     var   EXPENSE_TYPE  = Row.Details[0].EXPENSE_TYPE;        
     var   APPROVAL_STATUS  = Row.Details[0].APPROVAL_STATUS;     
     var   PAYMENT_STATUS  = Row.Details[0].PAYMENT_STATUS ;      
     var   APPROVED_AMOUNT_RPT  = Row.Details[0].APPROVED_AMOUNT_RPT;  
     var   APPROVED_AMOUNT = Row.Details[0].APPROVED_AMOUNT;       
     var   TRANSACTION_DATE  = Row.Details[0].TRANSACTION_DATE;     
     var   PERCENTAGE  = Row.Details[0].PERCENTAGE;           
     var   RECIEVING_COMPANY_CODE = Row.Details[0].RECIEVING_COMPANY_CODE;
     var   ORDER_NUMBER  = Row.Details[0].ORDER_NUMBER;         
     var   OPERATION_KEY  = Row.Details[0].OPERATION_KEY;
     var   REPORT_ID = Row.Details[0].REPORT_ID;    
     var   ALLOCATION_KEY = Row.Details[0].ALLOCATION_KEY;
     
	
  	var Pstmt = param.connection.prepareStatement(`INSERT INTO "CDS_DS.T_CONCUR_EXPENSES"( "EXPENSE_KEY.REPORT_ID","EXPENSE_KEY.ALLOCATION_KEY","EXPENSE.EMPLOYEE_ID", "EXPENSE.EMPLOYEE_NAME",
  	"EXPENSE.EMPLOYEE_COMPANY","EXPENSE.REPORT_NAME","EXPENSE.PURPOSE","EXPENSE.SENT_FOR_PAYMENT",
"EXPENSE.TOTAL_APPROVED_AMOUNT","EXPENSE.PAYMENT_TYPE","EXPENSE.EXPENSE_TYPE","EXPENSE.APPROVAL_STATUS","EXPENSE.PAYMENT_STATUS","EXPENSE.APPROVED_AMOUNT_RPT",
"EXPENSE.APPROVED_AMOUNT","EXPENSE.TRANSACTION_DATE","EXPENSE.PERCENTAGE","EXPENSE.RECIEVING_COMPANY_CODE","EXPENSE.ORDER_NUMBER","EXPENSE.OPERATION_KEY") VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  	Pstmt.setString(1,REPORT_ID.toString());
  	Pstmt.setString(2,ALLOCATION_KEY.toString());
  	Pstmt.setString(3,EMPLOYEE_ID.toString());
  	Pstmt.setString(4,EMPLOYEE_NAME.toString());
  	Pstmt.setString(5,EMPLOYEE_COMPANY.toString());
  	Pstmt.setString(6,REPORT_NAME.toString());
  	Pstmt.setString(7,PURPOSE.toString());
  	Pstmt.setString(8,SENT_FOR_PAYMENT.toString());
  	Pstmt.setString(9,TOTAL_APPROVED_AMOUNT.toString());
  	Pstmt.setString(10,PAYMENT_TYPE.toString());
  	Pstmt.setString(11,EXPENSE_TYPE.toString());
  	Pstmt.setString(12,APPROVAL_STATUS.toString());
    Pstmt.setString(13,PAYMENT_STATUS.toString());
  	Pstmt.setString(14,APPROVED_AMOUNT_RPT.toString());
  	Pstmt.setString(15,APPROVED_AMOUNT.toString());
  	Pstmt.setString(16,TRANSACTION_DATE.toString());
  	Pstmt.setString(17,PERCENTAGE.toString());
    Pstmt.setString(18,RECIEVING_COMPANY_CODE.toString());
  	Pstmt.setString(19,ORDER_NUMBER.toString());
  	Pstmt.setString(20,OPERATION_KEY.toString());
 
  	
  
    var Configuration = Pstmt.executeQuery();
		Pstmt.close();
}