require('dotenv').config();
const { Client } = require('pg');

async function updateAdminEmail() {
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

    // Update the old datawaves admin email to dataharbour
    const updateEmailResult = await client.query(`
      UPDATE users 
      SET email = 'admin@dataharbour.com',
          full_name = 'DataHarbour Admin'
      WHERE email = 'admin@datawaves.com'
    `);

    console.log(`\n✅ Updated email for ${updateEmailResult.rowCount} user(s) from datawaves.com to dataharbour.com`);

    // Remove any duplicate admin users (keep the one with dataharbour.com email)
    const removeDuplicatesResult = await client.query(`
      DELETE FROM users 
      WHERE email = 'admin@example.com' 
         OR (email != 'admin@dataharbour.com' AND role = 'admin' AND full_name LIKE '%Admin%')
    `);

    console.log(`✅ Removed ${removeDuplicatesResult.rowCount} duplicate/old admin user(s)`);

    // Ensure we have the correct admin user with proper password hash
    // Password hash for "DataHarbour2026!" 
    const ensureAdminResult = await client.query(`
      INSERT INTO users (full_name, email, password, phone, role) 
      VALUES ('DataHarbour Admin', 'admin@dataharbour.com', '$2b$10$rVHGOXHSA5lrvSy6TLWhbOxJqO0kO0oCdUWKDFyKKhjDQN8uEhihm', '+233208494123', 'admin')
      ON CONFLICT (email) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        password = EXCLUDED.password,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role
    `);

    console.log('✅ Ensured correct admin user exists with proper credentials');

    // Verify the final result
    const verifyResult = await client.query(`
      SELECT id, full_name, email, role 
      FROM users 
      WHERE role = 'admin'
      ORDER BY id
    `);
    
    console.log('\n📋 Final admin users:');
    verifyResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Name: "${user.full_name}", Email: ${user.email}`);
    });

    console.log('\n🎉 Admin credentials are now:');
    console.log('   Email: admin@dataharbour.com');
    console.log('   Password: DataHarbour2026!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

updateAdminEmail();