var connection = $.hdb.getConnection();

var dateDetails = {};

var query = 'SELECT TO_DATE(MIN("POSTING_DATE_KEY")) as "minDate", TO_DATE(MAX("POSTING_DATE_KEY")) as "maxDate" from  "CDS_DS.T_JOURNAL_ENTRY"';
rs = connection.executeQuery(query);
dateDetails.minDate = rs[0].minDate;
dateDetails.maxDate = rs[0].maxDate;

$.response.contentType = "application/json; charset=utf-8";
$.response.setBody(dateDetails);