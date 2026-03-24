require('dotenv').config();
const { Client } = require('pg');

async function updateAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // First, check current admin users
    const checkResult = await client.query(`
      SELECT id, full_name, email, role 
      FROM users 
      WHERE role = 'admin' OR email LIKE '%admin%'
    `);
    
    console.log('\n📋 Current admin users:');
    checkResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Name: "${user.full_name}", Email: ${user.email}`);
    });

    // Update admin name
    const updateResult = await client.query(`
      UPDATE users 
      SET full_name = 'DataHarbour Admin' 
      WHERE email = 'admin@dataharbour.com' 
         OR email = 'admin@datawaves.com'
         OR full_name LIKE '%DataWaves%'
    `);

    console.log(`\n✅ Updated ${updateResult.rowCount} user(s)`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT id, full_name, email, role 
      FROM users 
      WHERE role = 'admin' OR email LIKE '%admin%'
    `);
    
    console.log('\n📋 Updated admin users:');
    verifyResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Name: "${user.full_name}", Email: ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

updateAdmin();