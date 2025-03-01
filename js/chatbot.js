// CSV Reader for the XOX Wallet NDC Campaign Chatbot
// This script will read a CSV file containing customer campaign data

// Function to read and process CSV file
async function loadCustomerData() {
    try {
        // Fetch the CSV file (in production this would be your latest campaign data)
        const response = await fetch('data/ndc_campaign_data.csv');
        const csvText = await response.text();
        
        // Parse CSV data
        const customerData = parseCsvData(csvText);
        return customerData;
    } catch (error) {
        console.error('Error loading customer data:', error);
        return {};
    }
}

// Parse CSV into a usable format
function parseCsvData(csvText) {
    // Simple CSV parsing (in production, consider using a library like PapaParse)
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const customerData = {};
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const customer = {};
        
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j].trim();
            const value = values[j] ? values[j].trim() : '';
            customer[key] = value;
        }
        
        // Use walletId as the key for quick lookup
        if (customer.walletId) {
            customerData[customer.walletId] = customer;
        }
    }
    
    return customerData;
}

// Calculate customer's current tier based on consecutive months
function calculateTier(consecutiveMonths) {
    if (consecutiveMonths >= 3) {
        return '5%';
    } else if (consecutiveMonths === 2) {
        return '3.3%';
    } else {
        return '1.7%';
    }
}

// Format customer data for display
function formatCustomerStatus(customer) {
    const currentTier = calculateTier(parseInt(customer.consecutiveMonths));
    const nextTier = currentTier === '5%' ? 'Maximum tier reached' : 
                    currentTier === '3.3%' ? '5%' : '3.3%';
    
    return {
        name: customer.name,
        walletId: customer.walletId,
        consecutiveMonths: parseInt(customer.consecutiveMonths),
        currentTier: currentTier,
        nextTier: nextTier,
        currentMonthSpend: parseFloat(customer.currentMonthSpend),
        totalCashbackEarned: parseFloat(customer.totalCashbackEarned),
        lastTransaction: customer.lastTransaction
    };
}

// Generate a response based on the customer data and query
function generateResponse(customer, query) {
    const formattedCustomer = formatCustomerStatus(customer);
    
    // Basic status response
    let response = `Hello ${formattedCustomer.name}! Here's your NDC Campaign status:\n\n`;
    response += `Current Tier: ${formattedCustomer.currentTier} cashback\n`;
    response += `Consecutive Months: ${formattedCustomer.consecutiveMonths}\n`;
    response += `Current Month Spend: RM${formattedCustomer.currentMonthSpend.toFixed(2)}\n`;
    response += `Total Cashback Earned: RM${formattedCustomer.totalCashbackEarned.toFixed(2)}\n`;
    response += `Last Transaction: ${formattedCustomer.lastTransaction}\n\n`;
    
    // Check if specific information was requested
    if (query.toLowerCase().includes('tier')) {
        response += `Your current tier is ${formattedCustomer.currentTier} cashback. `;
        if (formattedCustomer.nextTier !== 'Maximum tier reached') {
            response += `Continue for ${3 - formattedCustomer.consecutiveMonths} more month(s) to reach ${formattedCustomer.nextTier} cashback!`;
        } else {
            response += `Congratulations! You've reached the maximum tier.`;
        }
    } else if (query.toLowerCase().includes('spend') || query.toLowerCase().includes('transaction')) {
        response += `This month, you've spent RM${formattedCustomer.currentMonthSpend.toFixed(2)}. Remember, you need to spend at least RM30 in a single transaction each month to qualify for cashback.`;
    } else if (query.toLowerCase().includes('cashback') || query.toLowerCase().includes('earn')) {
        response += `You've earned a total of RM${formattedCustomer.totalCashbackEarned.toFixed(2)} in cashback so far. At your current tier (${formattedCustomer.currentTier}), your next qualifying transaction will earn you ${formattedCustomer.currentTier} of the transaction value (up to RM50).`;
    } else {
        // Default additional info
        if (formattedCustomer.nextTier !== 'Maximum tier reached') {
            response += `Continue using your XOX Wallet this month to maintain your streak and reach ${formattedCustomer.nextTier} cashback!`;
        } else {
            response += `Congratulations! You've reached the maximum tier. Keep using your XOX Wallet to maintain your 5% cashback!`;
        }
    }
    
    return response;
}

// Export functions for use in the main chatbot interface
function initChatbot() {
    console.log('NDC Campaign Chatbot initialized');
    // You can add initialization logic here if needed
    
    // In a production environment, you would load the customer data from CSV here
    // loadCustomerData().then(data => {
    //     window.customerData = data;
    // });
}

// Initialize when the script loads
initChatbot();