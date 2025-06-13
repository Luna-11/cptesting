const mysql = require('mysql');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',               
  password: '',  
  database: 'studywithme'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Test a query
connection.query('SELECT * FROM Admin', (err, results) => {
  if (err) {
    console.error('Error in query:', err);
    return;
  }
  console.log(results);
});

// Close connection
connection.end();
