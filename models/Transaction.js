const db = require('../config/db');

class Transaction {
  // Create a new transaction
  static async create(transactionData) {
    const { 
      user_id, 
      plan_id, 
      network, 
      phone_number, 
      amount, 
      original_amount,
      status, 
      payment_reference, 
      confirmation_method, 
      confirmation_contact, 
      aggregator_response,
      is_guest,
      guest_email,
      guest_name
    } = transactionData;
    
    const query = `
      INSERT INTO transactions (
        user_id, plan_id, network, phone_number, amount, original_amount, status, 
        payment_reference, confirmation_method, confirmation_contact, aggregator_response,
        is_guest, guest_email, guest_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id
    `;
    const values = [
      user_id, 
      plan_id, 
      network, 
      phone_number, 
      amount, 
      original_amount || amount,
      status, 
      payment_reference, 
      confirmation_method, 
      confirmation_contact, 
      JSON.stringify(aggregator_response || {}),
      is_guest || false,
      guest_email,
      guest_name
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  // Get transactions by user ID
  static async getByUserId(userId) {
    const query = `
      SELECT t.*, dp.size, dp.price 
      FROM transactions t 
      JOIN data_plans dp ON t.plan_id = dp.id 
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC`;
    
    try {
      const result = await db.query(query, [userId]);
      // Parse JSON fields
      return result.rows.map(row => ({
        ...row,
        aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get all transactions (for admin)
  static async getAll() {
    const query = `
      SELECT t.*, u.full_name, u.email, dp.size 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      JOIN data_plans dp ON t.plan_id = dp.id 
      ORDER BY t.created_at DESC`;
    
    try {
      const result = await db.query(query);
      // Parse JSON fields
      return result.rows.map(row => ({
        ...row,
        aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get transaction by reference
  static async getByReference(reference) {
    const query = `
      SELECT t.*, dp.size, dp.price, dp.provider, 
             CASE 
               WHEN t.is_guest = true THEN t.guest_name
               ELSE u.full_name
             END as full_name,
             CASE 
               WHEN t.is_guest = true THEN t.guest_email
               ELSE u.email
             END as email
      FROM transactions t
      JOIN data_plans dp ON t.plan_id = dp.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.payment_reference = $1`;
    
    try {
      const result = await db.query(query, [reference]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          ...row,
          aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Update transaction status
  static async updateStatus(reference, status) {
    const query = 'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = $2';
    
    try {
      await db.query(query, [status, reference]);
    } catch (error) {
      throw error;
    }
  }

  // Update aggregator response
  static async updateAggregatorResponse(reference, response) {
    const query = 'UPDATE transactions SET aggregator_response = $1, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = $2';
    
    try {
      await db.query(query, [JSON.stringify(response), reference]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Transaction;