# 🏛️ CivicLens - Smart Civic Issue Management System

CivicLens is a comprehensive, AI-powered platform designed for smart cities to manage civic issues efficiently. It connects citizens, government officers, and administrators through a unified ecosystem, enabling real-time reporting, tracking, and resolution of civic problems.

## 🏗️ Architecture

The project is a monorepo consisting of four main components:

- **Backend** (`civiclens-backend`): A high-performance FastAPI server handling business logic, AI classification, and data management.
- **Admin Dashboard** (`civiclens-admin`): A Next.js-based web application for administrators to oversee operations, view analytics, and manage users.
- **Citizen Portal** (`civiclens-client`): A React/Vite web application for citizens to report issues and track their status.
- **Mobile App** (`civiclens-mobile`): A React Native (Expo) mobile application for citizens and field officers, featuring offline capabilities and GPS tracking.

## 🌟 Key Features

- **Multi-Channel Reporting**: Submit issues via Web or Mobile App with photos, location, and description.
- **AI-Powered Classification**: Automatically categorizes reports using a trained ML model to route them to the correct department.
- **Role-Based Access Control**: 7-tier user hierarchy (Citizen, Contributor, Moderator, Nodal Officer, Auditor, Admin, Super Admin) ensuring secure and appropriate access.
- **Geospatial Intelligence**: Location-based task assignment and visualization using PostGIS.
- **Offline-First Mobile App**: Field officers can update tasks without internet connectivity; data syncs when back online.
- **Real-time Analytics**: Comprehensive dashboards for monitoring resolution times, department performance, and issue trends.
- **Automated Workflow**: From report submission to assignment and resolution, the lifecycle is streamlined with automated notifications.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.109 (Python 3.11)
- **Database**: PostgreSQL with PostGIS (via SQLAlchemy 2.0 & AsyncPG)
- **Caching**: Redis 5.0+
- **Storage**: MinIO (S3-compatible object storage)
- **AI/ML**: Scikit-learn, Pandas (for classification)
- **Testing**: Pytest

### Frontend (Admin & Client)
- **Admin**: Next.js (App Router), Tailwind CSS, Recharts
- **Client**: React (Vite), Tailwind CSS, Radix UI
- **State Management**: React Query, Context API

### Mobile
- **Framework**: React Native (Expo SDK 54)
- **Database**: SQLite (local caching), Async Storage
- **Maps**: React Native Maps

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ with PostGIS extension enabled
- Docker & Docker Compose (optional, for running Redis/MinIO)

### 1. Infrastructure Setup

We provide a Docker Compose file to run the required infrastructure services (Redis and MinIO).

```bash
cd services
docker-compose up -d
```

Ensure your local PostgreSQL service is running and create a database named `civiclens`.

### 2. Backend Setup

```bash
cd civiclens-backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to match your local PostgreSQL credentials

# Run migrations
alembic upgrade head

# Seed initial data (Departments, Admin User, etc.)
python scripts/seed_all.py

# Start the server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000/api/v1`.
Documentation: `http://localhost:8000/docs`.

### 3. Admin Dashboard Setup

```bash
cd civiclens-admin

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Update NEXT_PUBLIC_API_URL if needed

# Start development server
npm run dev
```
Access at `http://localhost:3000`.

### 4. Citizen Portal Setup

```bash
cd civiclens-client

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```
Access at `http://localhost:5173`.

### 5. Mobile App Setup

```bash
cd civiclens-mobile

# Install dependencies
npm install

# Start Expo server
npx expo start
```
Use the Expo Go app on your phone to scan the QR code.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [Database Schema Summary](docs/DATABASE_SCHEMA_SUMMARY.md)
- [API Documentation](civiclens-backend/docs/)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Security Guide](docs/SECURITY_TESTING_GUIDE.md)

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
