# NovaVote - Cloud Deployment Guide

Detailed instructions for deploying NovaVote to various cloud platforms.

---

## 📋 Table of Contents

1. [Render Deployment](#render-deployment)
2. [Railway Deployment](#railway-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Azure Deployment](#azure-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Blockchain Networks](#blockchain-networks)

---

## 🎨 Render Deployment

Render offers free tier hosting with automatic deployments from GitHub.

### Prerequisites
- GitHub account
- Render account (https://render.com)
- Code pushed to GitHub repository

### Backend Deployment

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: novavote-backend
   Environment: Node
   Region: Choose closest to users
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: node src/server.js
   ```

3. **Environment Variables**
   Add these in the "Environment" section:
   ```
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   CHAIN_ID=11155111
   CORS_ORIGIN=https://your-frontend.onrender.com
   SESSION_SECRET=your-super-secret-key-here
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy
   - Note the URL (e.g., `https://novavote-backend.onrender.com`)

### Frontend Deployment

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Service**
   ```
   Name: novavote-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://novavote-backend.onrender.com
   VITE_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   VITE_CHAIN_ID=11155111
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Access at provided URL

### Custom Domain (Optional)
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed

---

## 🚂 Railway Deployment

Railway provides simple deployment with automatic configuration.

### Prerequisites
- GitHub account
- Railway account (https://railway.app)

### Deployment Steps

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Services**
   
   Railway auto-detects the monorepo structure.

   **Backend Service:**
   ```
   Root Directory: /backend
   Start Command: node src/server.js
   ```

   **Frontend Service:**
   ```
   Root Directory: /frontend
   Build Command: npm run build
   Start Command: npx serve -s dist -l $PORT
   ```

3. **Environment Variables**

   **Backend:**
   ```
   NODE_ENV=production
   BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   CHAIN_ID=11155111
   CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
   SESSION_SECRET=your-secret-key
   ```

   **Frontend:**
   ```
   VITE_API_URL=${{Backend.RAILWAY_STATIC_URL}}
   VITE_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ```

4. **Deploy**
   - Railway automatically deploys on push
   - Access via provided railway.app URLs

---

## 🟣 Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Backend Deployment

1. **Create Heroku App**
   ```bash
   heroku create novavote-backend
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   heroku config:set CHAIN_ID=11155111
   heroku config:set SESSION_SECRET=your-secret
   ```

4. **Create Procfile** (in backend directory)
   ```
   web: node src/server.js
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Heroku Static**
   Use the Heroku Static Buildpack or deploy to Netlify/Vercel

---

## ☁️ AWS Deployment

### Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or Elastic Beanstalk
- **Blockchain**: Infura/Alchemy or EC2

### Frontend Deployment (S3 + CloudFront)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://novavote-frontend
   aws s3 website s3://novavote-frontend --index-document index.html
   ```

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://novavote-frontend --acl public-read
   ```

4. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Enable HTTPS
   - Set custom domain (optional)

### Backend Deployment (EC2)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Security Group: Allow ports 22, 80, 443, 3000

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Clone repository
   git clone https://github.com/yourusername/novavote.git
   cd novavote/backend
   npm install

   # Create .env file
   nano .env
   # Add environment variables

   # Install PM2
   sudo npm install -g pm2
   pm2 start src/server.js --name novavote-backend
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/novavote
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

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

   ```bash
   sudo ln -s /etc/nginx/sites-available/novavote /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔵 Azure Deployment

### Frontend (Azure Static Web Apps)

1. **Create Static Web App**
   ```bash
   az staticwebapp create \
     --name novavote-frontend \
     --resource-group novavote-rg \
     --source https://github.com/yourusername/novavote \
     --location eastus2 \
     --branch main \
     --app-location "/frontend" \
     --output-location "dist"
   ```

2. **Configure Environment Variables**
   - Go to Azure Portal
   - Navigate to Static Web App
   - Add environment variables in Configuration

### Backend (Azure App Service)

1. **Create App Service**
   ```bash
   az webapp create \
     --resource-group novavote-rg \
     --plan novavote-plan \
     --name novavote-backend \
     --runtime "NODE:18-lts"
   ```

2. **Deploy Code**
   ```bash
   cd backend
   zip -r backend.zip .
   az webapp deployment source config-zip \
     --resource-group novavote-rg \
     --name novavote-backend \
     --src backend.zip
   ```

3. **Configure Environment**
   ```bash
   az webapp config appsettings set \
     --resource-group novavote-rg \
     --name novavote-backend \
     --settings NODE_ENV=production BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/KEY
   ```

---

## 🐳 Docker Deployment

### Local Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access Application**
   - Frontend: http://localhost
   - Backend: http://localhost:3000

### Production Docker Deployment

1. **Build Images**
   ```bash
   docker build -t novavote-backend:latest ./backend
   docker build -t novavote-frontend:latest ./frontend
   ```

2. **Push to Registry**
   ```bash
   docker tag novavote-backend:latest your-registry/novavote-backend:latest
   docker push your-registry/novavote-backend:latest
   
   docker tag novavote-frontend:latest your-registry/novavote-frontend:latest
   docker push your-registry/novavote-frontend:latest
   ```

3. **Deploy to Cloud**
   - AWS ECS
   - Azure Container Instances
   - Google Cloud Run
   - DigitalOcean App Platform

---

## ⛓️ Blockchain Networks

### Local Development
```javascript
// hardhat.config.js
networks: {
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 1337
  }
}
```

### Sepolia Testnet (Recommended for Testing)

1. **Get Sepolia ETH**
   - https://sepoliafaucet.com
   - https://www.infura.io/faucet/sepolia

2. **Setup Infura/Alchemy**
   - Sign up at https://infura.io or https://alchemy.com
   - Create project and get API key

3. **Update hardhat.config.js**
   ```javascript
   require('dotenv').config();
   
   module.exports = {
     networks: {
       sepolia: {
         url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
         accounts: [process.env.PRIVATE_KEY],
         chainId: 11155111
       }
     }
   };
   ```

4. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### Polygon Mumbai Testnet

1. **Get Mumbai MATIC**
   - https://faucet.polygon.technology

2. **Configure Network**
   ```javascript
   mumbai: {
     url: "https://rpc-mumbai.maticvigil.com",
     accounts: [process.env.PRIVATE_KEY],
     chainId: 80001
   }
   ```

### Ethereum Mainnet (Production)

⚠️ **Warning**: Requires real ETH for gas fees

```javascript
mainnet: {
  url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 1
}
```

---

## 🔐 Production Security Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Set specific CORS origins (not `*`)
- [ ] Use strong SESSION_SECRET
- [ ] Store private keys in secure vault (AWS Secrets Manager, Azure Key Vault)
- [ ] Enable rate limiting
- [ ] Implement authentication/authorization
- [ ] Use environment variables for all secrets
- [ ] Enable logging and monitoring
- [ ] Regular security audits
- [ ] DDoS protection (Cloudflare)
- [ ] Database backups (if using)
- [ ] Smart contract audits before mainnet

---

## 📊 Monitoring

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, Loggly, CloudWatch
- **Performance**: New Relic, Datadog
- **Blockchain**: Etherscan, Tenderly

---

## 💰 Cost Estimates

### Free Tier Options
- **Render**: 750 hours/month free
- **Railway**: $5 credit/month
- **Vercel/Netlify**: Free for static sites
- **AWS**: 12 months free tier

### Paid Production
- **Small Setup**: $10-30/month
  - Render/Railway basic plan
  - Infura free tier
  
- **Medium Setup**: $50-150/month
  - AWS t3.small EC2
  - CloudFront CDN
  - Alchemy growth plan

- **Enterprise**: $500+/month
  - Multiple regions
  - Load balancing
  - Dedicated blockchain nodes

---

*For questions or issues, refer to DEPLOYMENT.md or create an issue on GitHub.*
