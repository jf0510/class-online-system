
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'tttt0430',
    database : 'ClassChat_User'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;