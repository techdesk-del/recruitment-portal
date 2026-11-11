# 🚀 Synology DS925+ Deployment & Real-Time Sync Guide
**Recruitment Management Suite & Unified Ingestion Gateway**

---

## 📌 Executive Overview
The **Synology DiskStation DS925+** (AMD Ryzen Quad-Core x86_64, DSM 7.2+) is an enterprise-grade hardware platform capable of running containerized microservices with high I/O throughput.

This deployment provides:
1. **Zero-Latency Real-Time Sync**: Instant dashboard updates across all recruiters, interviewers, and HRs via WebSocket (`Socket.IO`).
2. **Resilient Database Layer**: High-performance on-premise MongoDB 7.0 container with Btrfs persistence, optional real-time cloud replication to MongoDB Atlas, and Redis caching.
3. **Turnkey Docker Compose Architecture**: Production-ready Nginx reverse proxy, Node.js API gateway, MongoDB, and Redis packaged for DSM **Container Manager**.

---

## 🏗️ Architecture Diagram

```
                             [ Synology DS925+ ]
                                      │
     ┌────────────────────────────────┴────────────────────────────────┐
     │                                                                 │
     ▼                                                                 ▼
[Web Browsers / Clients]                                   [External Services]
(Recruiters, HRs, Interviewers)                             (LinkedIn, Email, Cloud)
     │                                                                 │
     │ Port 3000 (HTTP/HTTPS)                                          │
     ▼                                                                 │
┌────────────────────────────────────────────────────────┐             │
│  recruitment-frontend (Nginx Alpine)                   │             │
│  - Static React Vite SPA Bundle                        │             │
│  - Reverse Proxy: /api/* -> backend:5000               │             │
│  - WebSocket Upgrade: /socket.io/* -> backend:5000     │             │
└───────────────────────────┬────────────────────────────┘             │
                            │ Internal Docker Bridge                   │
                            ▼                                          │
┌────────────────────────────────────────────────────────┐             │
│  recruitment-backend (Node.js 20 Express + Socket.IO)  │◄────────────┘
│  - Real-Time Broadcast Engine                          │
│  - BullMQ Queue & Worker Processor                     │
│  - Automated LinkedIn / Email IMAP Fetcher             │
│  - Real-Time Database Synchronizer                     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│ recruitment-mongo         │  │ recruitment-redis         │
│ - MongoDB 7.0             │  │ - Redis 7.0               │
│ - Vol: /volume1/docker/.. │  │ - BullMQ Job Store        │
│   mongodb-data            │  │ - Socket.io Pub/Sub       │
└──────────────┬────────────┘  └───────────────────────────┘
               │
               ▼ (Optional Dual-Persistence / Live Bridge)
┌────────────────────────────────────────────────────────┐
│ MongoDB Atlas Cloud Cluster                            │
│ (Real-Time Change Streams & Bidirectional Sync)        │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Prerequisites on Synology DSM 7.2+

1. Open **Package Center** in DSM and install:
   - **Container Manager** (Official Synology Docker package).
   - **Web Station** (Optional, if using custom domain hosting).
2. Open **File Station** and create the project folder structure:
   ```
   /volume1/docker/recruitment-dashboard/
   ├── backend/
   ├── frontend/
   ├── nas-data/
   │   ├── mongodb/
   │   ├── redis/
   │   └── backups/
   ├── docker-compose.yml
   └── .env
   ```

---

## 🚀 Deployment Instructions

### Method A: Via Synology Container Manager (DSM GUI - Recommended)

1. **Upload Files**:
   - Copy the project repository files to `/volume1/docker/recruitment-dashboard/`.
   - Copy `.env.nas.example` to `.env` inside `/volume1/docker/recruitment-dashboard/`.
2. **Open Container Manager**:
   - Go to DSM Main Menu -> **Container Manager**.
   - Click on the **Project** tab on the left sidebar.
   - Click **Create**.
3. **Configure the Project**:
   - **Project Name**: `recruitment-suite`
   - **Path**: Browse and select `/docker/recruitment-dashboard`
   - **Source**: Select *Use existing docker-compose.yml*
4. **Deploy**:
   - Click **Next** -> **Next** -> Check *Start the project once created* -> **Done**.
   - Container Manager will build the frontend and backend images and start all 4 containers (`recruitment-frontend`, `recruitment-backend`, `recruitment-mongo`, `recruitment-redis`).
5. **Access the Dashboard**:
   - Open your browser: `http://<SYNOLOGY_NAS_IP>:3000` (e.g., `http://192.168.1.150:3000`).

---

### Method B: Via SSH Terminal (Fastest for DevOps)

1. Connect to your DS925+ via SSH:
   ```bash
   ssh admin@<SYNOLOGY_NAS_IP> -p 22
   sudo -i
   ```
2. Navigate to the project directory:
   ```bash
   cd /volume1/docker/recruitment-dashboard
   ```
3. Prepare the environment file:
   ```bash
   cp .env.nas.example .env
   ```
4. Build and start the cluster:
   ```bash
   docker compose up -d --build
   ```
5. Check running status:
   ```bash
   docker compose ps
   ```

---

## 🔄 Real-Time Database Synchronization Setup

The deployment supports **three database operational modes**:

### Mode 1: 100% On-Premise NAS Database (Default)
- **Use Case**: Maximum performance on local office network (sub-millisecond queries) and 100% data sovereignty.
- **Config in `.env`**:
  ```env
  MONGODB_URI=mongodb://mongo:27017/recruitment_dashboard
  ```
- All candidate data, job postings, interviews, and logs are persisted to high-speed NVMe/HDD storage in `/volume1/docker/recruitment-dashboard/nas-data/mongodb`.

---

### Mode 2: Direct Cloud Synchronization (MongoDB Atlas)
- **Use Case**: Recruiters working both inside the office and remotely worldwide on the same live database.
- **Config in `.env`**:
  ```env
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mflxz4m.mongodb.net/recruitment_dashboard?retryWrites=true&w=majority
  ```
- Every write on the NAS immediately syncs with Atlas in real-time.

---

### Mode 3: Dual Real-Time Replication (Hybrid Cloud + NAS)
- **Use Case**: Offline resilience (NAS keeps working if the internet drops) + real-time cloud backup when online.
- **Config in `.env`**:
  ```env
  MONGODB_URI=mongodb://mongo:27017/recruitment_dashboard
  LOCAL_MONGODB_URI=mongodb://mongo:27017/recruitment_dashboard
  CLOUD_MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mflxz4m.mongodb.net/recruitment_dashboard?retryWrites=true&w=majority
  ```
- The built-in `realtimeDBSync.js` engine automatically establishes a bidirectional bridge:
  - Changes on the NAS stream to Atlas instantly.
  - Changes in Atlas stream to the NAS MongoDB instance.
  - Automatic Last-Write-Wins (LWW) conflict resolution.

---

## 🔒 DSM Reverse Proxy & SSL Configuration (HTTPS)

To access your recruitment suite securely with HTTPS and Let's Encrypt:

1. In DSM, go to **Control Panel** -> **Login Portal** -> **Advanced** tab -> **Reverse Proxy**.
2. Click **Create**:
   - **General**:
     - Reverse Proxy Name: `Recruitment Dashboard`
     - Source:
       - Protocol: `HTTPS`
       - Hostname: `careers.yourdomain.com` (or your Synology DDNS: `yourname.synology.me`)
       - Port: `443`
       - Enable HSTS: Checked
     - Destination:
       - Protocol: `HTTP`
       - Hostname: `localhost`
       - Port: `3000`
   - **Custom Header**:
     - Click **Create** -> **WebSocket**.
     - This automatically adds `Upgrade` and `Connection` headers so real-time Socket.IO sync works smoothly through DSM.
3. Click **Save**.

---

## 💾 Automated Database Backups (DSM Task Scheduler)

1. Make the backup script executable:
   ```bash
   chmod +x /volume1/docker/recruitment-dashboard/scripts/synology-backup.sh
   ```
2. In DSM, go to **Control Panel** -> **Task Scheduler**.
3. Click **Create** -> **Scheduled Task** -> **User-defined script**:
   - **Task**: `Recruitment DB Backup`
   - **User**: `root`
   - **Schedule**: Run daily at 02:00 AM.
   - **Task Settings (User-defined script)**:
     ```bash
     bash /volume1/docker/recruitment-dashboard/scripts/synology-backup.sh /volume1/docker/recruitment-dashboard
     ```
4. Backups are stored in `/volume1/docker/recruitment-dashboard/nas-data/backups` with a rolling 14-day retention cycle. These can be backed up offsite using **Synology Hyper Backup**.

---

## 🛠️ Diagnostics & Maintenance Cheat Sheet

| Task | Command |
|---|---|
| View real-time logs | `docker compose logs -f` |
| View backend sync logs | `docker logs -f recruitment-backend` |
| Restart services | `docker compose restart` |
| Stop cluster | `docker compose down` |
| Update application code | `git pull && docker compose up -d --build` |
| Test Mongo ping | `docker exec recruitment-mongo mongosh --eval "db.adminCommand('ping')"` |
| Test Redis ping | `docker exec recruitment-redis redis-cli ping` |

