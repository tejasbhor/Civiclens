# CivicLens — Official OCI Production Deployment Guide 🚀

This document details the configuration and deployment strategy used for the live CivicLens instance on Oracle Cloud Infrastructure (OCI).

---

## 🏗️ 1. Infrastructure Overview
- **Instance Type**: OCI Compute `VM.Standard.A1.Flex` (ARM64 / Ampere)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 6GB - 24GB (ARM Always Free is generous)
- **Storage**: 50GB+ Block Storage
- **Public IP**: `150.136.90.121` (Static via OCI Reserved Public IP)

---

## 🧠 2. RAM Management
While OCI ARM instances usually have plenty of RAM (up to 24GB in Always Free), we still use Swap as a safety net during heavy builds.

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

### **Step 3a: Initialize Server**
Run the initialization script to install Docker, setup firewall, and create folders:
```bash
chmod +x scripts/init-server.sh
./scripts/init-server.sh
```

### **Step 3b: Clone & Configure**
```bash
# Create the directory and take ownership
sudo mkdir -p /opt/civiclens
sudo chown ubuntu:ubuntu /opt/civiclens

# Clone the repository
git clone https://github.com/tejasbhor/Civiclens_ /opt/civiclens
cd /opt/civiclens
cp .env.production.example .env
# Edit .env with your real DB passwords and SMTP keys
nano .env
```

### **Step 3c: Build & Start**
Use the `cloud_sync.txt` script or run:
```bash
cd /opt/civiclens
# Pull latest images from GHCR
docker compose pull
# Start services
docker compose up -d
# Run migrations
docker compose exec -T backend alembic upgrade head
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
- **Secrets Needed in GitHub**:
  - `OCI_HOST`: Your OCI Public IP
  - `OCI_USER`: `ubuntu`
  - `OCI_SSH_KEY`: Content of your private SSH key (`.key` or `.pem`).

---

## 🧪 6. Demo Mode
To show OTPs directly in the UI for portfolio presentations:
1. In `.env`, set `ENABLE_DEMO_OTP=true`.
2. Restart services: `docker compose up -d`.
3. The Admin and Citizen portals will now display a "Demo OTP" hint during login.

---

## 🚨 7. Emergency Recovery
**If SSH stops responding:**
1. Check OCI Console -> Compute Instance -> **Reboot**.
2. Check Security Lists: Ensure ports 22, 80, 443 are open in the VCN.

**If Database is empty:**
1. Seed the dummy data:
   `sudo docker compose exec backend python scripts/seed_all.py`

---

**Last Updated**: March 14, 2026
**Maintainer**: CivicLens Team
