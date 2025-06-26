const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  // Database connection - UPDATE THESE VALUES!
  const connection = await mysql.createConnection({
    host: 'localhost',      // Your MySQL host
    user: 'root',           // Your MySQL username
    password: '',   // Your MySQL password
    database: 'studywithme' // Your database name
  });

  // Admin configuration
  const adminPassword = '12345'; // Default admin password
  const adminRoleId = 1;         // Role ID for admin (different from default 2)
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Check for existing admins
    const [existingAdmins] = await connection.execute(
      'SELECT name FROM user WHERE name LIKE "admin%" AND role_id = ? ORDER BY name DESC LIMIT 1',
      [adminRoleId]
    );

    // Generate next admin number
    let nextAdminNumber = 1;
    if (existingAdmins.length > 0) {
      const lastAdmin = existingAdmins[0].name;
      nextAdminNumber = parseInt(lastAdmin.replace('admin', '')) + 1;
    }
    
    const adminName = `admin${nextAdminNumber}`;
    const adminEmail = `${adminName}@admin.com`;

    // Create admin user
    const [userResult] = await connection.execute(
      'INSERT INTO user (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [adminName, adminEmail, hashedPassword, adminRoleId]
    );

    console.log(`✅ Admin created successfully:
      User ID: ${userResult.insertId}
      Username: ${adminName}
      Email: ${adminEmail}
      Password: ${adminPassword}
      Role ID: ${adminRoleId}`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await connection.end();
  }
})();