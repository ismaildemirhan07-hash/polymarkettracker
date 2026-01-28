# DigitalOcean VPS Deployment Guide

## Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04 recommended, minimum 2GB RAM)
- PostgreSQL database
- Redis (optional but recommended)
- Domain name (optional)

## Setup Instructions

### 1. Connect to your VPS

```bash
ssh root@your-server-ip
```

### 2. Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Redis (optional)
apt install -y redis-server

# Install PM2 for process management
npm install -g pm2
```

### 3. Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE polymarket_tracker;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE polymarket_tracker TO your_user;
\q
```

### 4. Clone and Setup Application

```bash
# Create app directory
mkdir -p /var/www/polymarket-tracker
cd /var/www/polymarket-tracker

# Clone your repository (or upload files)
git clone https://github.com/ismaildemirhan07-hash/polymarkettracker.git .

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
nano .env
```

### 5. Configure Environment Variables

Edit `.env`:

```bash
NODE_ENV=production
PORT=5000

# Update with your database credentials
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/polymarket_tracker

# Redis (if installed)
REDIS_URL=redis://localhost:6379

# Optional API keys
FINNHUB_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here

# Features
ENABLE_WEBSOCKET=true
LOG_LEVEL=info
```

### 6. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (optional)
npm run prisma:seed
```

### 7. Build Application

```bash
npm run build
```

### 8. Start with PM2

```bash
# Start the application
pm2 start npm --name "polymarket-tracker" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 9. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 5000
ufw enable
```

### 10. Setup Nginx Reverse Proxy (Recommended)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/polymarket-tracker
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/polymarket-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 11. Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renew
certbot renew --dry-run
```

## Maintenance Commands

```bash
# View logs
pm2 logs polymarket-tracker

# Restart application
pm2 restart polymarket-tracker

# Stop application
pm2 stop polymarket-tracker

# Monitor
pm2 monit

# Update application
cd /var/www/polymarket-tracker
git pull
npm install
npm run build
pm2 restart polymarket-tracker
```

## Monitoring & Health Check

Access health endpoint:
```
http://your-server-ip:5000/health
```

## Troubleshooting

### Application won't start
```bash
pm2 logs polymarket-tracker --lines 100
```

### Database connection issues
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U your_user -d polymarket_tracker
```

### Redis issues
```bash
# Check Redis is running
systemctl status redis-server

# Test Redis
redis-cli ping
```

## Security Recommendations

1. Change default PostgreSQL password
2. Configure firewall to only allow necessary ports
3. Setup SSH key authentication
4. Disable root login
5. Keep system updated: `apt update && apt upgrade`
6. Use environment variables for sensitive data
7. Setup automated backups for database

## Backup Database

```bash
# Backup
pg_dump -U your_user polymarket_tracker > backup.sql

# Restore
psql -U your_user polymarket_tracker < backup.sql
```
