# AI File Syncing Website

This project is a self-hosted, privacy-respecting file syncing and organization tool designed to run alongside Raspberry Pi-based network privacy tools like Pi-hole and PiVPN. It provides file management with intelligent search, file tagging, and local-only redundancy detection. 

---

## Features

- View, upload, and organize files in a hierarchical structure
- Search files with AI-assisted suggestions (WIP)
- Detect and manage redundant files (WIP)
- Lightweight and designed for local hosting alongside Pi-hole and PiVPN
- Minimal external dependencies

## To-Do

### Backend
- [x] Fix bug where uploaded files are placed in the root directory regardless of the current view
- [x] Fix bug where files that are not in root are not deleted
- [ ] Implement intelligent file search using embeddings or fuzzy matching
- [x] Enable recursive deletion of folders and their contents
- [ ] Set up cron job for scanning and flagging exact duplicate files

### Frontend
- [x] **Upload**
  - [x] Fix bug so uploaded files go to the currently viewed directory
  - [x] Add full functionality to `UploadCard` component

- [x] **DisplayDirectory Component**
  - [x] Clicking the home button should always display the root node
  - [x] Implement download button functionality
  - [x] After deleting a file, reset `selector` state to `false`

- [x] **Sidebar Component**
  - [x] Add functionality for "New Folder"
  - [x] Add functionality for "New File"

- [x] **FolderTree Component**
  - [x] Fix bug when uploading a new file so only the parent node of the uploaded file is re-rendered instead of the whole recursion tree

---

# AI Features

## Search Functionality
- [ ] Research and select a lightweight NLP model (e.g., DistilBERT, MobileBERT).
- [ ] Integrate the model with the Raspberry Pi.
- [ ] Develop a search interface for users to query files based on content.

#### Redundancy Detection
- [ ] Implement hashing algorithms (e.g., SHA-256) to identify exact duplicate files
- [ ] Set up cron job to run duplicate check on a schedule
- [ ] Explore semantic similarity detection with embeddings or content analysis

## Tagging System
- [ ] Design a rule-based tagging system for files.
- [ ] Explore lightweight classifiers

---

## Tech Stack
- React
- React Router
- Express
- Node.js
- CSS
- Vite
- PostgreSQL
- Prisma (ORM)
- WebSockets (real-time updates)
- Lucide (icons)
- Planned: AI/ML Integration (lightweight NLP models for search and redundancy)

---

# FileSync - Docker Installation Guide

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/fileSync.git
cd fileSync
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Web Interface: http://localhost:3000
- WebSocket Server: ws://localhost:8080

The setup includes:
- PostgreSQL database (automatically configured)
- FileSync application running in development mode (`npm run dev`)
- WebSocket server
- Persistent data volumes

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key configuration options:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Main application port (default: 3000)
- `WS_PORT`: WebSocket server port (default: 8080)
- `MAX_FILE_SIZE`: Maximum file upload size
- `NODE_ENV`: Environment (production/development)

### Database Configuration

The Docker setup uses PostgreSQL with these default settings:
- Database: `filesync`
- User: `filesync`
- Password: `filesync_password_change_me` (⚠️ **Change this in production!**)

To change the database password:
1. Update `POSTGRES_PASSWORD` in `docker-compose.yml`
2. Update `DATABASE_URL` in your `.env` file
3. Restart: `docker-compose down && docker-compose up -d`

## Management Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f filesync
docker-compose logs -f postgres

# Stop the application
docker-compose down

# Update to latest version
git pull
docker-compose build filesync
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U filesync filesync > backup.sql

# Restore database
docker-compose exec -T postgres psql -U filesync filesync < backup.sql

# Backup all data
docker run --rm -v filesync_data:/data -v filesync_uploads:/uploads -v $(pwd):/backup alpine tar czf /backup/filesync-backup.tar.gz /data /uploads
```

## Data Persistence

All data is stored in Docker volumes:
- `postgres_data`: PostgreSQL database
- `filesync_data`: User files and sync data  
- `filesync_uploads`: Uploaded files

Data persists between container restarts and updates.

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U filesync -d filesync -c "SELECT version();"
```

### Reset Database (⚠️ **Deletes all data!**)
```bash
docker-compose down -v
docker-compose up -d
```

### Port Conflicts
If ports 3000 or 8080 are in use, modify `docker-compose.yml`:

```yaml
services:
  filesync:
    ports:
      - "8000:3000"  # Use port 8000 instead of 3000
      - "8081:8080"  # Use port 8081 instead of 8080
```

### Application Logs
```bash
# View application logs
docker-compose logs filesync

# Follow logs in real-time
docker-compose logs -f filesync

# Access container shell
docker-compose exec filesync sh
```

## Security Considerations

### For Production Deployment:

1. **Change default database password**:
   ```yaml
   environment:
     POSTGRES_PASSWORD: your-secure-password-here
   ```

2. **Generate secure secrets** in `.env`:
   ```bash
   # Generate random secrets
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For SESSION_SECRET
   ```

3. **Use environment-specific configurations**:
   - Set `NODE_ENV=production`
   - Configure proper `CORS_ORIGIN`
   - Use strong database credentials

4. **Network security**:
   - Use a reverse proxy (nginx)
   - Enable HTTPS/TLS
   - Configure firewall rules

## Development Mode

This Docker setup runs your application in **development mode** using `npm run dev`, just like your current tmux setup. This means:

- ✅ No build step required
- ✅ Faster startup times
- ✅ All development dependencies available
- ✅ Same behavior as your current `tmux` + `npm run dev` workflow

If you want to run it in production mode later, you can:
1. Change `NODE_ENV=development` to `NODE_ENV=production` in docker-compose.yml
2. Update the start script to use `npm start` instead of `npm run dev`
3. Add a build step to the Dockerfile