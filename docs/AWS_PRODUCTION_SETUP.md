# CivicLens — Official AWS Production Deployment Guide 🚀

This document details the **exact** configuration and deployment strategy used for the live CivicLens instance on AWS EC2 (Small Instance).

---

## 🏗️ 1. Infrastructure Overview
- **Instance Type**: AWS EC2 `t4g.small` (ARM64 / Graviton)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 2GB (Critical: Requires Swap)
- **Storage**: 30GB General Purpose SSD
- **Public IP**: `52.55.40.61` (Static via Elastic IP recommended)

---

## 🧠 2. RAM Management (Small Instance Hack)
Building Next.js/React apps on a 2GB instance will **freeze** the server. You **must** configure Virtual RAM (Swap) before building.

### **Step 2a: Create a 4GB Swap File**
Run these commands if the server ever freezes or feels laggy:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🛠️ 3. Deployment Steps

### **Step 3a: Clone & Configure**
```bash
mkdir -p /opt/civiclens && cd /opt/civiclens
git clone https://github.com/tejasbhor/Civiclens_ .
cp .env.production.example .env
# Edit .env with your real DB passwords and SMTP keys
nano .env
```

### **Step 3b: The "Safe" Build Script**
Since memory is limited, use this "Single Block" command to update the code without crashing the server. It limits Node.js RAM usage to 1GB.

```bash
cd /opt/civiclens
git pull origin main

# 1. Stop everything to clear RAM
sudo docker compose down

# 2. Build the HEAVY PART (Admin Dashboard) with strict memory limits
NODE_OPTIONS="--max-old-space-size=1024" sudo docker compose build admin

# 3. Start the full platform
sudo docker compose up -d --build

# 4. Apply database migrations
sudo docker compose exec -T backend alembic upgrade head
```

---

## 🌍 4. Domain & SSL (Caddy)
We use **Caddy** as the reverse proxy because it handles SSL (HTTPS) automatically.
- **Paths**:
  - `https://civiclens.space` -> Citizen Portal
  - `https://admin.civiclens.space` -> Admin Dashboard
  - `https://api.civiclens.space` -> Backend API

---

## 🤖 5. CI/CD (GitHub Actions)
The platform is configured to deploy automatically whenever you push to `main`.
- **Workflow Path**: `.github/workflows/deploy.yml`
- **Secrets Needed**:
  - `OCI_HOST`: Your server IP (`52.55.40.61`)
  - `OCI_USER`: `ubuntu`
  - `OCI_SSH_KEY`: Content of your `.pem` key.

---

## 🧪 6. Demo Mode
To show OTPs directly in the UI for portfolio presentations:
1. In `.env`, set `ENABLE_DEMO_OTP=true`.
2. Re-run the **Safe Build Script** (Step 3b).
3. The Admin and Citizen portals will now display a "Demo OTP" hint during login.

---

## 🚨 7. Emergency Recovery
**If SSH stops responding:**
1. Go to AWS Console -> EC2 -> **Stop** (Force Stop if needed) -> **Start**.
2. Wait 30 seconds, SSH back in.
3. Check status: `sudo docker compose ps`.

**If Database is empty:**
1. Seed the dummy data:
   `sudo docker compose exec backend python scripts/seed_all.py`

---

**Last Updated**: March 13, 2026
**Maintainer**: CivicLens Team
