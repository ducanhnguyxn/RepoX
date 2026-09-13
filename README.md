# RepoX

RepoX is a GitHub-inspired developer platform for creating, managing, and sharing software repositories. Users can create repositories, upload and manage code, track commits, collaborate with other developers, and explore public projects through a simple and modern interface.

## What's Inside

This project combines a modern React frontend with a Node.js backend:

- **Frontend**: React with Vite, clean UI components
- **Backend**: Express API with MongoDB storage
- **Bonus**: Simple CLI for local version control with S3 storage

## Getting Started

### Setup

1. Make sure you have Node.js 18+ and MongoDB installed
2. Create a `.env` file in the backend folder:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/repox
JWT_SECRET_KEY=your_secret_key
```

For S3 features (optional):
```
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Running the App

**Backend:**
```
cd backend
npm install
node index.js start
```

**Frontend:**
```
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173, connecting to the backend at http://localhost:3000.

## Main Features

- **User Management**: Create accounts, login, update profiles
- **Repository Management**: Create public/private repos with descriptions
- **Issue Tracking**: Create and manage issues for each repository
- **Dashboard**: View your repos and discover trending projects

## API Endpoints

All endpoints are relative to `http://localhost:3000`

### User Endpoints
- `POST /signup` - Register a new user
- `POST /login` - Authenticate user
- `GET /allUsers` - List all users
- `GET /userProfile/:id` - Get user details
- `PUT /updateProfile/:id` - Update user profile
- `DELETE /deleteProfile/:id` - Delete user account

### Repository Endpoints
- `POST /create` - Create a new repository
- `GET /repo/all` - List all repositories
- `GET /repo/:id` - Get repository by ID
- `GET /repo/name/:name` - Get repository by name
- `GET /repo/user/:userID` - Get repositories for a user
- `PUT /repo/update/:id` - Update repository content/description
- `PATCH /repo/update/:id` - Toggle repository visibility
- `DELETE /repo/delete/:id` - Delete a repository
- `POST /repo/:id/files` - Add file to repository
- `GET /repo/:id/files` - Get repository files
- `GET /repo/:id/files/:filePath` - Get file content
- `DELETE /repo/:id/files/:filePath` - Delete file from repository

### Issue Endpoints
- `POST /issue/create` - Create a new issue
- `GET /issue/all` - List all issues
- `GET /issue/:id` - Get issue by ID
- `PUT /issue/:id` - Update an issue
- `DELETE /issue/:id` - Delete an issue

## Command Line Tools

RepoX includes a simple Git-like CLI for local version control:

```
# Initialize a repo
node index.js init

# Add files
node index.js add myfile.txt

# Commit changes
node index.js commit "Added new feature"

# Push/pull from S3
node index.js push
node index.js pull

# Revert to previous commit
node index.js revert --commitId abc123
```

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Express, MongoDB, JWT authentication
- **Storage**: MongoDB for app data, S3 for CLI version control

## Deployment to DigitalOcean Kubernetes

Automated CI/CD pipeline that builds Docker images and deploys to DigitalOcean Kubernetes.

### Prerequisites

1. **DigitalOcean Kubernetes Cluster** - Named `repox-cluster` with all secrets configured
2. **Docker Hub Account** - For storing Docker images
3. **GitHub Secrets** - Add these 3 secrets to your repo:
   - `DIGITALOCEAN_ACCESS_TOKEN` - DigitalOcean API token
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub password

### How to Deploy

Just push to main branch:
```bash
git push origin main
```

The CI/CD pipeline automatically builds and deploys everything!

### What the CI/CD Does

Every push to `main` automatically:
1. Builds Docker images for frontend and backend
2. Pushes images to Docker Hub (tagged with commit SHA)
3. Connects to DigitalOcean Kubernetes cluster
4. Updates deployments with new images (zero-downtime rolling updates)
5. Waits for deployments to be healthy
6. Reports deployment status

### Kubernetes Architecture

Production-ready setup with industry best practices:

- **Separation of concerns** – Frontend/backend have independent deployments
- **Auto-scaling** – HPA scales pods based on CPU usage (2-5 replicas)
- **Health checks** – Readiness/liveness probes ensure reliability
- **Load balancing** – Ingress with SSL termination
- **Resource limits** – Prevents resource exhaustion
- **Secrets management** – Secure handling of sensitive data
