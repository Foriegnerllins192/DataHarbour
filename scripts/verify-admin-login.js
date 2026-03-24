require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function verifyAdminLogin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get the current admin user
    const adminResult = await client.query(`
      SELECT id, full_name, email, password, role 
      FROM users 
      WHERE email = 'admin@dataharbour.com'
    `);

    if (adminResult.rows.length === 0) {
      console.log('❌ No admin user found with email admin@dataharbour.com');
      return;
    }

    const admin = adminResult.rows[0];
    console.log(`\n📋 Found admin user:`);
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.full_name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);

    // Test password verification
    const testPassword = 'DataHarbour2026!';
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);

    if (!isPasswordValid) {
      console.log('\n🔧 Regenerating password hash...');
      
      // Generate new hash for the correct password
      const newHash = await bcrypt.hash(testPassword, 10);
      
      // Update the password in database
      const updateResult = await client.query(`
        UPDATE users 
        SET password = $1 
        WHERE email = 'admin@dataharbour.com'
      `, [newHash]);

      console.log(`✅ Password hash updated for ${updateResult.rowCount} user(s)`);
      
      // Verify the new hash works
      const verifyNewHash = await bcrypt.compare(testPassword, newHash);
      console.log(`New password verification: ${verifyNewHash ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    console.log('\n🎉 Admin login credentials:');
    console.log('   Email: admin@dataharbour.com');
    console.log('   Password: DataHarbour2026!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

verifyAdminLogin();