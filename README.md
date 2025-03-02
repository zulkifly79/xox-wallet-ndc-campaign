# XOX Wallet NDC Cashback Campaign

A web application with an HTML page and LLM-powered chatbot to support the XOX Wallet NDC Cashback Campaign.

## Features

- Responsive campaign information page
- LLM-powered chatbot for natural language customer interactions
- SQLite database integration for real-time customer data access
- FAQ section for common queries

## System Architecture

The application consists of:

1. **Frontend**:
   - HTML/CSS/JavaScript for campaign page
   - Interactive chatbot UI that communicates with backend

2. **Backend**:
   - Node.js server with Express.js
   - LLM integration via API (e.g., OpenAI)
   - SQLite database connection for customer data

## Setup Instructions

### Frontend Setup

1. Clone this repository to your local machine or server
2. Deploy the HTML, CSS, and JavaScript files to any web hosting service that supports static sites
3. Configure the API endpoint in `js/chatbot.js` to point to your backend server

### Backend Setup

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env` and configure your environment variables:
   ```
   cp .env.example .env
   ```
3. Edit `.env` file to include your LLM API key and other settings
4. Install dependencies:
   ```
   npm install
   ```
5. Initialize the SQLite database (for development/testing):
   ```
   npm run init-db
   ```
6. Start the server:
   ```
   npm start
   ```

## Database Schema

The SQLite database includes the following tables:

1. **customers** - User information
   - wallet_id (PRIMARY KEY)
   - name
   - email
   - phone
   - registration_date

2. **monthly_transactions** - Transaction records
   - id (PRIMARY KEY)
   - wallet_id (FOREIGN KEY)
   - transaction_date
   - amount
   - transaction_type
   - description

3. **cashback_history** - Cashback rewards
   - id (PRIMARY KEY)
   - wallet_id (FOREIGN KEY)
   - month
   - cashback_percentage
   - cashback_amount
   - processed_date
   - status

## LLM Integration

The chatbot uses an LLM (e.g., OpenAI's GPT) to:

1. Understand natural language queries about the NDC Campaign
2. Generate helpful, contextual responses based on user's questions
3. Incorporate real-time customer data from the database into responses
4. Provide personalized tier status and cashback information

## Production Deployment

### Frontend Deployment
- Deploy the static files via GitHub Pages or any web hosting service
- Configure CORS settings if needed

### Backend Deployment
- Deploy the Node.js backend to a cloud service (e.g., AWS, Heroku, etc.)
- Set up a production database or connect to your existing SQLite database
- Configure environment variables on your hosting platform
- Ensure proper security measures (HTTPS, API keys protection, etc.)

## Connecting to Your Existing SQLite Database

To connect the chatbot to your existing SQLite database:

1. Modify the database queries in `backend/server.js` to match your database schema
2. Update the `DB_PATH` environment variable to point to your database file
3. If your database structure differs significantly from the sample schema, update the following files:
   - `backend/server.js` - Modify SQL queries to match your tables/columns
   - `backend/init-db.js` - Update schema creation (if needed for testing)

## Updating Campaign Data

Unlike the static CSV approach, the LLM-powered chatbot with SQLite integration automatically works with your latest data without requiring manual CSV updates. Your database should:

1. Have up-to-date customer transactions
2. Track the consecutive qualifying months accurately
3. Calculate cashback amounts based on the tier structure

## Chatbot Features

The LLM-powered chatbot can handle:

- Natural language questions about the campaign
- Complex queries about eligibility and rewards
- Personalized cashback status and tier information
- Questions about transaction history and next tier requirements
- Escalation to human support for non-campaign related issues

## Security Considerations

Since the system connects to your database and uses an LLM API:

1. Never expose your LLM API keys in frontend code
2. Implement proper authentication for API endpoints
3. Use HTTPS for all communications
4. Sanitize all user inputs before using in SQL queries
5. Implement rate limiting to prevent abuse
6. Consider implementing user authentication for accessing personal data

## Support

For technical issues with the campaign page or chatbot, contact the development team at dev@xoxwallet.com