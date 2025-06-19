const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'your_database'
  });

  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Check if admin exists in users table
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [adminUsername]
    );

    if (users.length === 0) {
      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [adminUsername, hashedPassword, 'admin']
      );

      const userId = userResult.insertId;

      // Insert into admin sub table
      await connection.execute(
        'INSERT INTO admin (user_id, created_by_system) VALUES (?, ?)',
        [userId, 1]
      );

      console.log('Admin account and admin subtable entry created.');
    } else {
      console.log('Admin account already exists.');
    }

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await connection.end();
  }
})();
