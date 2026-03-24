const pool = require('../config/db');

async function updateAdminName() {
  let client;
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    
    // Get a client from the pool
    client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Update the admin user's full name from "DataWaves Admin" to "DataHarbour Admin"
    const updateQuery = `
      UPDATE users 
      SET full_name = 'DataHarbour Admin' 
      WHERE email = 'admin@dataharbour.com' 
      OR email = 'admin@datawaves.com'
      OR full_name LIKE '%DataWaves Admin%'
      OR full_name LIKE '%DataWaves%'
    `;
    
    console.log('Updating admin user name...');
    const result = await client.query(updateQuery);
    
    if (result.rowCount > 0) {
      console.log(`✅ Successfully updated ${result.rowCount} admin user(s)`);
      
      // Verify the update
      const verifyQuery = `
        SELECT id, full_name, email, role 
        FROM users 
        WHERE role = 'admin'
      `;
      
      const verifyResult = await client.query(verifyQuery);
      console.log('\n📋 Current admin users:');
      verifyResult.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}`);
      });
    } else {
      console.log('⚠️  No admin users found to update');
      
      // Show all users for debugging
      const allUsersQuery = 'SELECT id, full_name, email, role FROM users LIMIT 10';
      const allUsers = await client.query(allUsersQuery);
      console.log('\n📋 Current users in database:');
      allUsers.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating admin name:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('\n🔧 Connection failed. Please try one of these solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify DATABASE_URL in .env file');
      console.log('3. Run the SQL manually in your Neon dashboard');
      console.log('\n📝 Manual SQL to run:');
      console.log(`UPDATE users SET full_name = 'DataHarbour Admin' WHERE email = 'admin@dataharbour.com' OR email = 'admin@datawaves.com' OR full_name LIKE '%DataWaves%';`);
    }
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update
updateAdminName();
updateAdminName();