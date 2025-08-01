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
- [ ] Implement intelligent file search using embeddings or fuzzy matching
- [ ] Create REST endpoints for tag creation and management
- [ ] Enable recursive deletion of folders and their contents
- [ ] Set up cron job for scanning and flagging exact duplicate files

### Frontend
- [ ] **Upload**
  - [ ] Fix bug so uploaded files go to the currently viewed directory
  - [ ] Add full functionality to `UploadCard` component

- [ ] **Search**
  - [ ] Fix issue where clicking on a folder/file result sets display to the clicked node instead of its parent

- [ ] **DisplayDirectory Component**
  - [ ] Clicking the home button should always display the root node
  - [ ] Implement download button functionality
  - [ ] Fix delete bug — currently only deletes children of the root node
  - [ ] After deleting a file, reset `selector` state to `false`

- [ ] **Sidebar Component**
  - [ ] Add functionality for "New Folder"
  - [ ] Add functionality for "New File"

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
