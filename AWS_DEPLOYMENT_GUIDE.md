# ☁️ Dulhaniya - AWS Production Deployment Architecture & Setup Guide

This guide outlines the production deployment architectures available for Dulhaniya on Amazon Web Services (AWS), with step-by-step procedures, cost models, and configuration instructions.

---

## 1. Architecture Comparison & Recommendations

| Architecture Option | Monthly Cost | Operational Overhead | Auto-Scaling | Best For |
| :--- | :---: | :---: | :---: | :--- |
| **Option A: AWS Lightsail (Recommended)** | **$3.50 – $5.00** | Very Low (1-Click) | Manual upgrade | **Immediate MVP & Production Launch** (Zero hassle, flat pricing) |
| **Option B: AWS App Runner / Beanstalk** | $15 – $25 | Low (PaaS) | Automatic (0 to N) | High-volume traffic spikes (Wedding season rush) |
| **Option C: AWS EC2 (t4g.micro / t3.micro)** | Free Tier / $4 | Medium (Nginx + Linux) | With Auto-Scaling Group | Traditional full control with reverse proxy & custom certs |
| **Option D: S3 + CloudFront + Lambda** | < $2.00 | Low (Serverless) | Instant Infinite | Static SPA + Serverless Microservices |

### ⭐ Recommendation for Launch: Option A (AWS Lightsail)
- **Why:** Dulhaniya has zero external npm or pip dependencies. Node.js `server.js` or Python `server.py` runs natively on a 512MB / 1GB Lightsail Ubuntu/Amazon Linux instance for just $3.50/month with predictable billing, automated backups, and free Let's Encrypt SSL.
- **Latency:** Deployed in AWS Region `ap-south-1` (Mumbai) provides ultra-fast response times (< 25ms) across Delhi NCR, Mumbai, Bengaluru, and Jaipur.

---

## 2. Step-by-Step Deployment Walkthrough: AWS Lightsail

### Step 1: Create Instance
1. Log in to [AWS Console](https://console.aws.amazon.com/lightsail).
2. Choose Region: **Asia Pacific (Mumbai) `ap-south-1`**.
3. Select Platform: **Linux/Unix** -> Blueprint: **OS Only (Ubuntu 24.04 LTS or Amazon Linux 2023)**.
4. Select Instance Plan: **$3.50/month** (512 MB RAM, 1 vCPU, 20 GB SSD, 1 TB transfer).
5. Name your instance: `dulhaniya-prod-app`.
6. Click **Create instance**.

### Step 2: Configure Static IP & Firewall Ports
1. In Lightsail Networking, click **Create static IP** and attach it to `dulhaniya-prod-app`.
2. In IPv4 Firewall, add rules:
   - **HTTP (Port 80)** - TCP - Anywhere
   - **HTTPS (Port 443)** - TCP - Anywhere
   - **Custom (Port 8000)** - TCP (optional for testing)
   - **SSH (Port 22)** - TCP

### Step 3: Server Provisioning via SSH
Connect via browser SSH or your local terminal:
```bash
# 1. Update packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (or Python 3)
sudo apt install -y nodejs npm git

# 3. Clone Dulhaniya repository
cd /var/www
sudo git clone https://github.com/madhuptiwari/DulhaniyaApp.git
cd DulhaniyaApp

# 4. Install PM2 process manager for 100% uptime
sudo npm install -g pm2

# 5. Start Dulhaniya companion server
pm2 start server.js --name "dulhaniya" --env PORT=8000
pm2 startup
pm2 save
```

### Step 4: Configure Nginx Reverse Proxy & Free SSL
```bash
# 1. Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Configure Nginx proxy to port 8000
sudo nano /etc/nginx/sites-available/dulhaniya
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # or your static Lightsail IP

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# 3. Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/dulhaniya /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 4. Issue free automated Let's Encrypt SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 3. Alternative: Docker / AWS App Runner (CI/CD Automated)

If containerized continuous deployment from GitHub is preferred:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 8000
ENV PORT=8000
CMD ["node", "server.js"]
```

In AWS App Runner:
1. Connect your GitHub repository `https://github.com/madhuptiwari/DulhaniyaApp.git`.
2. Select branch `main`.
3. Choose runtime **Node.js 20** (Build command: empty, Start command: `node server.js`, Port: 8000).
4. Every time you push a commit to GitHub, App Runner automatically rebuilds and rolls out the update with zero downtime.

---

## 4. What We Need From You to Establish Deployment

To proceed with live AWS provisioning on your behalf, please share your preferred path:

1. **Deployment Architecture Choice:**
   - Would you like to use **AWS Lightsail** (simple, low-cost $3.50/mo, fastest setup) or **AWS App Runner / Elastic Beanstalk** (auto-scaling containerized)?
2. **AWS Credentials / Access:**
   - Do you already have an AWS Account?
   - Can you provide an **IAM User Access Key ID & Secret Access Key** (with Lightsail/EC2 Administrator permissions), or would you prefer we generate a 1-click CloudFormation / Terraform script that you can run in your AWS console?
3. **Domain Name & DNS:**
   - Do you have a domain name purchased (e.g., on GoDaddy, Namecheap, or Route 53) such as `dulhaniya.in` or `dulhaniya.com`? If so, we can configure DNS and issue an automated SSL certificate. If not, we will launch initially on the static AWS public IP.
4. **Target Region:**
   - We recommend `ap-south-1` (Mumbai) for minimum latency (< 25ms) across Indian metros. Please confirm if this is suitable.
