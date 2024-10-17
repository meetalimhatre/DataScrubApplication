var connection = $.hdb.getConnection();

var query = 'SELECT CURRENT_USER FROM "DUMMY"';
//var rs = connection.executeQuery(query);
var currentUser = "hello"//rs[0].CURRENT_USER;
/*
query = `SELECT SESSION_CONTEXT('APPLICATIONUSER') "APPLICATION_USER" 
                FROM "DUMMY"`;
rs = connection.executeQuery(query);
var applicationUser = rs[0].APPLICATION_USER;
*/
var greeting =
	`XS Layer Session User: ${$.session.getUsername()}
    </br>Database Current User: ${currentUser} 
    
    </br>Welcome to HANA `;
    
    var session = $.session;

$.response.contentType = "application/json; charset=utf-8";
$.response.setBody(session);