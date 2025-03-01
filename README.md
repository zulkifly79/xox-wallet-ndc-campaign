# XOX Wallet NDC Cashback Campaign

A web application that includes an HTML page and interactive chatbot to support the XOX Wallet NDC Cashback Campaign.

## Features

- Responsive campaign information page
- Interactive chatbot for customer support
- CSV data processing for personalized customer information
- FAQ section for common queries

## Files

- `index.html`: The main campaign page with embedded chatbot
- `js/chatbot.js`: JavaScript module for chatbot functionality
- `data/ndc_campaign_data.csv`: Sample customer data (to be updated regularly)

## Setup Instructions

1. Clone this repository to your local machine or server
2. Place the latest CSV data file in the `data` folder
3. Deploy to any web hosting service that supports static sites

## Chatbot Features

The chatbot can handle the following customer queries:
- Check current tier status based on wallet ID
- Provide information on cashback earned
- Explain campaign mechanics and eligibility
- Show current month's spending
- Help customers understand how to reach the next tier

## Updating Customer Data

1. Export the latest customer data as a CSV file with the following columns:
   - walletId
   - name
   - email
   - consecutiveMonths
   - currentMonthSpend
   - totalCashbackEarned
   - lastTransaction
   - registrationDate
2. Save the file as `ndc_campaign_data.csv` in the `data` folder
3. The chatbot will automatically use the latest data when customers interact with it

## GitHub Pages Deployment

This repository is configured to be deployed via GitHub Pages. After pushing changes:
1. Go to the repository settings
2. Navigate to the "Pages" section
3. Select the "main" branch as the source
4. Click "Save"

The campaign page will be available at `https://[your-username].github.io/xox-wallet-ndc-campaign/`

## Support

For technical issues with the campaign page or chatbot, contact the development team at dev@xoxwallet.com