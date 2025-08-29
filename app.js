const mysql = require('mysql');

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',               
  password: '',  
  database: 'studywithme',
  connectionLimit: 10,
  acquireTimeout: 10000,
  timeout: 60000,
});

// Test a query using the pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error getting connection from pool:', err);
    return;
  }
  
  console.log('Connected to MySQL database!');
  
  connection.query('SELECT * FROM Admin', (err, results) => {
    // Always release the connection back to the pool
    connection.release();
    
    if (err) {
      console.error('Error in query:', err);
      return;
    }
    console.log(results);
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing pool:', err);
    } else {
      console.log('Database pool closed gracefully');
    }
    process.exit(0);
  });
});

// Alternative: Using promises for better async handling
function queryDatabase(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      
      connection.query(sql, params, (error, results) => {
        connection.release(); // Always release connection
        
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  });
}

// Example usage of the promise-based function
async function testQuery() {
  try {
    const results = await queryDatabase('SELECT * FROM Admin');
    console.log('Query results:', results);
  } catch (error) {
    console.error('Query error:', error);
  }
}