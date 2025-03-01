# Setting Up GitHub Pages

To make your XOX NDC Campaign website accessible via a URL, follow these steps to enable GitHub Pages:

1. Go to your repository: https://github.com/zulkifly79/xox-wallet-ndc-campaign

2. Click on "Settings" in the top navigation bar.

3. Scroll down to the "GitHub Pages" section (or click on "Pages" in the sidebar).

4. Under "Source", select "Deploy from a branch".

5. Under "Branch", select "main" and "/root" folder, then click "Save".

6. Wait a few minutes for GitHub to build and deploy your site.

7. Once deployed, you'll see a message saying "Your site is published at https://zulkifly79.github.io/xox-wallet-ndc-campaign/".

8. Click on the link to visit your live site.

## Testing the Application

1. Once your site is published, navigate to the URL provided by GitHub Pages.

2. Test the chatbot functionality by clicking on the chat icon in the bottom right.

3. Try entering a wallet ID (e.g., "12345" or "67890") to see customer information.

4. Test various questions about the campaign to see how the chatbot responds.

## Updating Customer Data

When you need to update the customer data:

1. Export the latest data as a CSV file with the required format.

2. Replace the file in the `data` folder through the GitHub web interface.

3. GitHub Pages will automatically update with the new data.

## Troubleshooting

If your site doesn't appear after enabling GitHub Pages:
- Make sure your repository is public or you have GitHub Pro for private repository pages
- Check if there were any build errors in the "Actions" tab
- Try forcing a rebuild by making a small change to a file