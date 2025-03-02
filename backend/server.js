// Backend server for XOX Wallet NDC Campaign chatbot
// Handles: LLM integration, SQL database queries, and response formatting

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database connection
let db;
async function initializeDB() {
  db = await open({
    filename: process.env.DB_PATH || './data/ndc_campaign.db',
    driver: sqlite3.Database
  });
  console.log('SQLite database connected');
}

// Initialize database connection
initializeDB().catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});

// LLM Integration (using OpenAI as an example)
async function generateLLMResponse(userQuery, customerData = null) {
  try {
    // Build prompt with customer data if available
    let prompt = `You are the XOX Wallet NDC Campaign assistant. The campaign offers cashback rewards:
- 1st Month: 1.7% cashback (up to RM50)
- 2nd Consecutive Month: 3.3% cashback (up to RM50)
- 3rd Consecutive Month and beyond: 5% cashback (up to RM50)
- Campaign period: April 1, 2025 to September 30, 2025
- Minimum transaction amount: RM30 per month

User query: ${userQuery}`;

    // Add customer data to prompt if available
    if (customerData) {
      prompt += `\n\nCustomer data:
- Name: ${customerData.name}
- Wallet ID: ${customerData.walletId}
- Consecutive qualifying months: ${customerData.consecutiveMonths}
- Current month spend: RM${customerData.currentMonthSpend.toFixed(2)}
- Total cashback earned: RM${customerData.totalCashbackEarned.toFixed(2)}
- Last transaction date: ${customerData.lastTransaction}`;
    }

    // Call the LLM API (OpenAI example)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('LLM API error:', error);
    return 'I apologize, but I encountered an issue processing your request. Please try again or contact customer support.';
  }
}

// API Routes
// Get customer data from database
app.get('/api/customer/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const customer = await db.get(`
      SELECT 
        c.wallet_id as walletId,
        c.name,
        c.email,
        (
          SELECT COUNT(*) 
          FROM monthly_transactions 
          WHERE wallet_id = c.wallet_id 
          AND amount >= 30 
          AND transaction_date >= date('now', '-3 months')
          AND transaction_date <= date('now')
          GROUP BY strftime('%Y-%m', transaction_date)
          ORDER BY transaction_date DESC
          LIMIT 3
        ) as consecutiveMonths,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM monthly_transactions
          WHERE wallet_id = c.wallet_id
          AND transaction_date >= date('now', 'start of month')
        ) as currentMonthSpend,
        (
          SELECT COALESCE(SUM(cashback_amount), 0)
          FROM cashback_history
          WHERE wallet_id = c.wallet_id
        ) as totalCashbackEarned,
        (
          SELECT MAX(transaction_date)
          FROM monthly_transactions
          WHERE wallet_id = c.wallet_id
        ) as lastTransaction
      FROM customers c
      WHERE c.wallet_id = ?
    `, walletId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process chatbot message
app.post('/api/chat', async (req, res) => {
  try {
    const { message, walletId } = req.body;
    
    // Check if this is a wallet ID lookup
    const walletIdPattern = /^\d{5}$/;
    const lookupWalletId = walletIdPattern.test(message) ? message : walletId;
    
    let customerData = null;
    
    // If we have a wallet ID to lookup, get the customer data
    if (lookupWalletId) {
      try {
        customerData = await db.get(`
          SELECT 
            c.wallet_id as walletId,
            c.name,
            c.email,
            (
              SELECT COUNT(*) 
              FROM monthly_transactions 
              WHERE wallet_id = c.wallet_id 
              AND amount >= 30 
              AND transaction_date >= date('now', '-3 months')
              AND transaction_date <= date('now')
              GROUP BY strftime('%Y-%m', transaction_date)
              ORDER BY transaction_date DESC
              LIMIT 3
            ) as consecutiveMonths,
            (
              SELECT COALESCE(SUM(amount), 0)
              FROM monthly_transactions
              WHERE wallet_id = c.wallet_id
              AND transaction_date >= date('now', 'start of month')
            ) as currentMonthSpend,
            (
              SELECT COALESCE(SUM(cashback_amount), 0)
              FROM cashback_history
              WHERE wallet_id = c.wallet_id
            ) as totalCashbackEarned,
            (
              SELECT MAX(transaction_date)
              FROM monthly_transactions
              WHERE wallet_id = c.wallet_id
            ) as lastTransaction
          FROM customers c
          WHERE c.wallet_id = ?
        `, lookupWalletId);
      } catch (dbError) {
        console.error('Database lookup error:', dbError);
        // Continue without customer data
      }
    }
    
    // Generate response with LLM
    const llmResponse = await generateLLMResponse(message, customerData);
    
    res.json({ response: llmResponse, customerData });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
