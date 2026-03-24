const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function testAdminLogin() {
  console.log('🧪 Testing admin login process...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    // Test credentials
    const testEmail = 'admin@dataharbour.com';
    const testPassword = 'DataHarbour2026!';
    
    console.log('🔍 Looking up admin user...');
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found!');
      client.release();
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Admin user found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    // Test password verification
    console.log('🔐 Testing password verification...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 Admin login should work with these credentials:');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
      
      // Test admin role
      if (user.role === 'admin') {
        console.log('✅ Admin role confirmed - full admin access granted');
      } else {
        console.log('❌ User role is not admin:', user.role);
      }
    } else {
      console.log('❌ Password verification failed!');
      console.log('The stored password hash might be incorrect.');
      
      // Let's create a new hash and update
      console.log('🔧 Creating new password hash...');
      const newHash = await bcrypt.hash(testPassword, 10);
      
      await client.query('UPDATE users SET password = $1 WHERE email = $2', [newHash, testEmail]);
      console.log('✅ Password hash updated. Try logging in again.');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminLogin();