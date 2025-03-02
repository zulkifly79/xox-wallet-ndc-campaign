// Enhanced Chatbot for XOX Wallet NDC Campaign
// Integrates with backend API for LLM responses and SQLite database queries

// Configuration
const API_ENDPOINT = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://api.xoxwallet.com/api'; // Replace with your actual API endpoint in production

// DOM Elements
let chatbotContainer;
let chatbotMessages;
let chatbotInput;
let chatbotSend;
let chatIcon;
let chatbotClose;

// State
let currentWalletId = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initChatbot);

function initChatbot() {
  console.log('NDC Campaign Chatbot initializing...');
  
  // Get DOM elements
  chatbotContainer = document.getElementById('chatbot-container');
  chatbotMessages = document.getElementById('chatbot-messages');
  chatbotInput = document.getElementById('chatbot-input');
  chatbotSend = document.getElementById('chatbot-send');
  chatIcon = document.getElementById('chat-icon');
  chatbotClose = document.getElementById('chatbot-close');
  
  if (!chatbotContainer || !chatbotMessages || !chatbotInput || !chatbotSend || !chatIcon || !chatbotClose) {
    console.error('Chatbot elements not found in DOM');
    return;
  }
  
  // Add event listeners
  chatIcon.addEventListener('click', openChatbot);
  chatbotClose.addEventListener('click', closeChatbot);
  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', handleKeyPress);
  
  console.log('NDC Campaign Chatbot initialized');
}

// Open chatbot and display welcome message
function openChatbot() {
  chatbotContainer.style.display = 'flex';
  chatIcon.style.display = 'none';
  
  // Add welcome message if it's empty
  if (chatbotMessages.children.length === 0) {
    addBotMessage("👋 Hi there! I'm your NDC Campaign Assistant. I can help you check your cashback status, explain campaign rules, and more. What would you like to know?");
    addBotMessage("To check your status, please provide your XOX Wallet ID.");
  }
}

// Close chatbot
function closeChatbot() {
  chatbotContainer.style.display = 'none';
  chatIcon.style.display = 'flex';
}

// Handle Enter key press
function handleKeyPress(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
}

// Send user message to chatbot
function sendMessage() {
  const message = chatbotInput.value.trim();
  if (message === '') return;
  
  // Add user message to chat
  addUserMessage(message);
  chatbotInput.value = '';
  
  // Check if message is a wallet ID
  const walletIdPattern = /^\d{5}$/;
  if (walletIdPattern.test(message)) {
    currentWalletId = message;
  }
  
  // Show loading indicator
  const loadingMsgId = addBotMessage("Thinking...");
  
  // Send message to backend
  processMessageWithBackend(message, currentWalletId)
    .then(response => {
      // Remove loading message
      removeMessage(loadingMsgId);
      
      // Update current wallet ID if we got customer data
      if (response.customerData) {
        currentWalletId = response.customerData.walletId;
      }
      
      // Add response to chat
      addBotMessage(response.response);
    })
    .catch(error => {
      // Remove loading message
      removeMessage(loadingMsgId);
      
      // Add error message
      addBotMessage("I'm sorry, I encountered an issue processing your request. Please try again or contact customer support.");
      console.error('Error processing message:', error);
    });
}

// Process message using backend API
async function processMessageWithBackend(message, walletId = null) {
  try {
    // Call backend API
    const response = await fetch(`${API_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, walletId })
    });
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Backend API error:', error);
    
    // Fallback to local processing if backend is unavailable
    return {
      response: `I'm currently having trouble connecting to our servers. Here's what I know about the NDC Campaign:

The NDC Campaign offers increasing cashback rewards based on consecutive months of usage:
- 1st Month: 1.7% cashback
- 2nd Consecutive Month: 3.3% cashback
- 3rd Consecutive Month and beyond: 5% cashback

The maximum transaction value eligible for cashback is RM50 per month.

For personalized information about your status, please try again later or contact customer support.`
    };
  }
}

// Add user message to chat
function addUserMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'user-message';
  messageElement.textContent = message;
  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Add bot message to chat and return message ID
function addBotMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'bot-message';
  messageElement.textContent = message;
  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  
  // Return a unique ID for this message (for loading indicators)
  return Date.now().toString();
}

// Remove a message by ID
function removeMessage(messageId) {
  const messages = chatbotMessages.querySelectorAll('.bot-message');
  // Remove the last "thinking..." message
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.textContent === "Thinking...") {
      lastMessage.remove();
    }
  }
}

// Export functions for testing
if (typeof module !== 'undefined') {
  module.exports = {
    initChatbot,
    processMessageWithBackend
  };
}
