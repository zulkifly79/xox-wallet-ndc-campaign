// Database initialization script for XOX Wallet NDC Campaign
// Creates tables and adds sample data

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initializeDatabase() {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  require('fs').mkdirSync(dataDir, { recursive: true });
  
  // Open the database
  const db = await open({
    filename: path.join(dataDir, 'ndc_campaign.db'),
    driver: sqlite3.Database
  });
  
  console.log('Creating database schema...');
  
  // Create tables
  await db.exec(`
    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      wallet_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      registration_date TEXT
    );
    
    -- Monthly transactions
    CREATE TABLE IF NOT EXISTS monthly_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id TEXT NOT NULL,
      transaction_date TEXT NOT NULL,
      amount REAL NOT NULL,
      transaction_type TEXT,
      description TEXT,
      FOREIGN KEY (wallet_id) REFERENCES customers (wallet_id)
    );
    
    -- Cashback history
    CREATE TABLE IF NOT EXISTS cashback_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id TEXT NOT NULL,
      month TEXT NOT NULL,
      cashback_percentage REAL NOT NULL,
      cashback_amount REAL NOT NULL,
      processed_date TEXT NOT NULL,
      status TEXT DEFAULT 'processed',
      FOREIGN KEY (wallet_id) REFERENCES customers (wallet_id)
    );
  `);
  
  // Insert sample data
  console.log('Adding sample data...');
  
  // First, check if we already have data
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
  if (customerCount.count > 0) {
    console.log('Sample data already exists, skipping...');
    await db.close();
    return;
  }
  
  // Insert sample customers
  await db.exec(`
    INSERT INTO customers (wallet_id, name, email, phone, registration_date) VALUES
    ('12345', 'Ahmed', 'ahmed@example.com', '+60123456789', '2024-12-10'),
    ('67890', 'Sarah', 'sarah@example.com', '+60187654321', '2024-11-22'),
    ('24680', 'Michael', 'michael@example.com', '+60145678901', '2025-01-05'),
    ('13579', 'Liyana', 'liyana@example.com', '+60167890123', '2025-02-15'),
    ('86420', 'David', 'david@example.com', '+60189012345', '2025-01-10'),
    ('97531', 'Fatimah', 'fatimah@example.com', '+60123789456', '2024-10-05'),
    ('35791', 'Jason', 'jason@example.com', '+60178901234', '2025-03-01'),
    ('75319', 'Nurul', 'nurul@example.com', '+60134567890', '2025-02-20'),
    ('02468', 'Raj', 'raj@example.com', '+60156789012', '2024-11-15')
  `);
  
  // Insert sample transactions (last 3 months)
  const currentDate = new Date();
  
  // Function to get date X months ago in YYYY-MM-DD format
  function getDateMonthsAgo(months) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split('T')[0];
  }
  
  // Create transactions for each customer for the last 3 months
  const walletIds = ['12345', '67890', '24680', '13579', '86420', '97531', '35791', '75319', '02468'];
  
  for (const walletId of walletIds) {
    // Current month transactions
    if (['12345', '67890', '24680', '86420', '97531', '35791', '75319', '02468'].includes(walletId)) {
      await db.run(`
        INSERT INTO monthly_transactions (wallet_id, transaction_date, amount, transaction_type, description)
        VALUES (?, ?, ?, 'purchase', 'Retail transaction')
      `, walletId, getDateMonthsAgo(0), Math.floor(Math.random() * 30) + 30);
    }
    
    // Last month transactions
    if (['12345', '67890', '86420', '97531', '75319', '02468'].includes(walletId)) {
      await db.run(`
        INSERT INTO monthly_transactions (wallet_id, transaction_date, amount, transaction_type, description)
        VALUES (?, ?, ?, 'purchase', 'Retail transaction')
      `, walletId, getDateMonthsAgo(1), Math.floor(Math.random() * 30) + 30);
    }
    
    // Two months ago transactions
    if (['67890', '86420', '97531', '02468'].includes(walletId)) {
      await db.run(`
        INSERT INTO monthly_transactions (wallet_id, transaction_date, amount, transaction_type, description)
        VALUES (?, ?, ?, 'purchase', 'Retail transaction')
      `, walletId, getDateMonthsAgo(2), Math.floor(Math.random() * 30) + 30);
    }
  }
  
  // Insert cashback history based on transaction history
  // For the sake of this example, we'll calculate and insert directly
  
  // 1st month (1.7%) for all qualifying customers
  await db.exec(`
    INSERT INTO cashback_history (wallet_id, month, cashback_percentage, cashback_amount, processed_date)
    SELECT 
      wallet_id, 
      strftime('%Y-%m', transaction_date) as month,
      1.7 as cashback_percentage,
      CASE 
        WHEN amount > 50 THEN 50 * 0.017
        ELSE amount * 0.017
      END as cashback_amount,
      date('now', '-1 month') as processed_date
    FROM monthly_transactions
    WHERE transaction_date BETWEEN date('now', '-3 months') AND date('now', '-2 months')
    AND amount >= 30
  `);
  
  // 2nd month (3.3%) for qualifying customers
  await db.exec(`
    INSERT INTO cashback_history (wallet_id, month, cashback_percentage, cashback_amount, processed_date)
    SELECT 
      t2.wallet_id, 
      strftime('%Y-%m', t2.transaction_date) as month,
      3.3 as cashback_percentage,
      CASE 
        WHEN t2.amount > 50 THEN 50 * 0.033
        ELSE t2.amount * 0.033
      END as cashback_amount,
      date('now', '-1 month') as processed_date
    FROM monthly_transactions t2
    WHERE t2.transaction_date BETWEEN date('now', '-2 months') AND date('now', '-1 month')
    AND t2.amount >= 30
    AND EXISTS (
      SELECT 1 
      FROM monthly_transactions t1 
      WHERE t1.wallet_id = t2.wallet_id
      AND t1.transaction_date BETWEEN date('now', '-3 months') AND date('now', '-2 months')
      AND t1.amount >= 30
    )
  `);
  
  // 3rd month (5%) for qualifying customers
  await db.exec(`
    INSERT INTO cashback_history (wallet_id, month, cashback_percentage, cashback_amount, processed_date)
    SELECT 
      t3.wallet_id, 
      strftime('%Y-%m', t3.transaction_date) as month,
      5.0 as cashback_percentage,
      CASE 
        WHEN t3.amount > 50 THEN 50 * 0.05
        ELSE t3.amount * 0.05
      END as cashback_amount,
      date('now') as processed_date
    FROM monthly_transactions t3
    WHERE t3.transaction_date >= date('now', '-1 month')
    AND t3.amount >= 30
    AND EXISTS (
      SELECT 1 
      FROM monthly_transactions t2 
      WHERE t2.wallet_id = t3.wallet_id
      AND t2.transaction_date BETWEEN date('now', '-2 months') AND date('now', '-1 month')
      AND t2.amount >= 30
      AND EXISTS (
        SELECT 1 
        FROM monthly_transactions t1 
        WHERE t1.wallet_id = t2.wallet_id
        AND t1.transaction_date BETWEEN date('now', '-3 months') AND date('now', '-2 months')
        AND t1.amount >= 30
      )
    )
  `);
  
  console.log('Database initialized successfully!');
  await db.close();
}

// Run the initialization
initializeDatabase().catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});
