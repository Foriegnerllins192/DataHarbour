const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');

    const adminEmail = process.env.ADMIN_EMAIL_LOGIN || 'admin@dataharbour.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'DataHarbour2026!';
    const adminName = 'DataHarbour Admin';
    const adminPhone = process.env.ADMIN_PHONE || '+233208494123';

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
    const existingAdmin = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length > 0) {
      // Update existing admin user
      await db.query(
        'UPDATE users SET password = $1, full_name = $2, phone = $3, role = $4 WHERE email = $5',
        [hashedPassword, adminName, adminPhone, 'admin', adminEmail]
      );
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
      await db.query(
        'INSERT INTO users (full_name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5)',
        [adminName, adminEmail, hashedPassword, adminPhone, 'admin']
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n🌐 Admin Access URLs:');
    console.log(`Admin Dashboard: ${process.env.APP_URL || 'http://localhost:3003'}/admin`);
    console.log(`Direct Login: ${process.env.APP_URL || 'http://localhost:3003'}/login.html`);

    console.log('\n⚠️  Security Note:');
    console.log('Please change the default admin password after first login!');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupAdmin();