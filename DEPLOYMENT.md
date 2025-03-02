# XOX Wallet NDC Campaign Deployment Guide

This guide provides step-by-step instructions for deploying both the frontend and backend components of the XOX Wallet NDC Campaign application.

## Frontend Deployment (GitHub Pages)

The simplest way to deploy the frontend is using GitHub Pages:

1. Go to your repository: https://github.com/zulkifly79/xox-wallet-ndc-campaign

2. Click on "Settings" in the top navigation bar.

3. Select "Pages" from the left sidebar.

4. Under "Source", select "Deploy from a branch".

5. Select "main" branch and the root directory ("/"), then click "Save".

6. Wait a few minutes for GitHub to build and deploy your site.

7. Your frontend will be available at: https://zulkifly79.github.io/xox-wallet-ndc-campaign/

## Backend Deployment

You have several options for deploying the Node.js backend:

### Option 1: Deploy to a VPS (DigitalOcean, AWS EC2, etc.)

1. Set up a Virtual Private Server (Ubuntu recommended)

2. Install Node.js and npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/zulkifly79/xox-wallet-ndc-campaign.git
   cd xox-wallet-ndc-campaign/backend
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up environment variables:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

6. Initialize the database (or configure to use your existing SQLite database):
   ```bash
   npm run init-db
   ```

7. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

8. Start the server with PM2:
   ```bash
   pm2 start server.js --name xox-ndc-backend
   pm2 save
   pm2 startup
   ```

9. Set up Nginx as a reverse proxy:
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/xox-backend
   ```

10. Add this configuration (replace example.com with your domain):
    ```
    server {
        listen 80;
        server_name api.example.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. Enable the site and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/xox-backend /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. Set up SSL with Let's Encrypt:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.example.com
    ```

### Option 2: Deploy to Heroku

1. Install the Heroku CLI:
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create xox-ndc-backend
   ```

4. Add a Procfile in the backend directory:
   ```
   echo "web: node server.js" > Procfile
   ```

5. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku config:set OPENAI_MODEL=gpt-3.5-turbo
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

6. Deploy the backend:
   ```bash
   git subtree push --prefix backend heroku main
   ```

7. For SQLite on Heroku, you'll need to modify your implementation to use PostgreSQL instead, as Heroku's ephemeral filesystem doesn't work well with SQLite.

## Connecting Frontend to Backend

Once both are deployed, update the `API_ENDPOINT` in `js/chatbot.js`:

```javascript
const API_ENDPOINT = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://api.example.com/api'; // Replace with your actual backend URL
```

## Database Options

### Option 1: Use SQLite (simplest for small applications)
- Works well for moderate traffic
- Follow the setup in this repository
- Ensure your database file is in a persistent storage location

### Option 2: Migrate to PostgreSQL or MySQL
- Recommended for high-traffic production use
- Modify the database connection code in `server.js`
- Use a cloud-hosted database service (AWS RDS, DigitalOcean Managed Database, etc.)

## Maintenance

1. **Monitoring**: Set up monitoring for your backend server using PM2 or a service like New Relic

2. **Logs**: Implement proper logging and log rotation

3. **Backups**: Set up regular database backups

4. **SSL Renewal**: Let's Encrypt certificates auto-renew, but verify they're properly renewing

5. **Updates**: Regularly update dependencies for security patches

## Troubleshooting

- **CORS Issues**: If the frontend can't connect to the backend, check CORS settings in `server.js`
- **Database Errors**: Verify database path and permissions
- **API Key Issues**: Ensure your LLM API key is valid and has sufficient quota
- **Memory Issues**: If the server crashes, you might need to increase memory allocation

For additional assistance, contact dev@xoxwallet.com