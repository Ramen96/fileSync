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
- [ ] Create REST endpoints for tag creation and management
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
