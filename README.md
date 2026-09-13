# RepoX

RepoX is a full-stack platform for hosting and managing code repositories — think a lightweight, self-hosted take on GitHub. Create an account, spin up public or private repositories, push files through a REST API, track issues per repo, and browse other people's public projects from a React dashboard.

A small Git-like CLI ships alongside the web app for local version control backed by S3, if you'd rather work from the terminal than the browser.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Command Line Tools](#command-line-tools)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

## Features

- **Accounts** — sign up, log in with JWT-based auth, update or delete your profile
- **Repositories** — create public or private repos, toggle visibility, attach a description
- **File management** — add, read, and delete files inside a repository through the API
- **Issue tracking** — open, edit, and close issues scoped to a repository
- **Dashboard** — see your own repos and discover public projects from other users
- **CLI** — a minimal `init` / `add` / `commit` / `push` / `pull` / `revert` workflow with S3-backed storage

## Tech Stack

| Layer      | Stack                                              |
|------------|-----------------------------------------------------|
| Frontend   | React 19, React Router, Vite, Axios                 |
| Backend    | Node.js, Express 5, Mongoose (MongoDB)              |
| Auth       | JWT, bcrypt                                         |
| Storage    | MongoDB for app data, AWS S3 for CLI version control|
| Deployment | Docker, Kubernetes (DigitalOcean), GitHub Actions   |

## Project Structure

```
RepoX/
├── backend/          Express API, MongoDB models, and the local-VCS CLI
│   ├── controllers/  Route handlers (users, repos, issues, CLI commands)
│   ├── middleware/    Auth + ownership checks
│   ├── models/        Mongoose schemas
│   └── routes/        Express routers
├── frontend/          React app (Vite)
│   └── src/components/  Auth, dashboard, repo, and issue UI
├── kubernetes/        Deployment manifests, services, ingress, autoscaling
└── .github/workflows/ CI/CD pipeline (build → push → deploy)
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or a connection string)
- An AWS S3 bucket, only if you want the CLI's push/pull features

### Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/repox
JWT_SECRET_KEY=your_secret_key
```

Optional, for CLI S3 storage:

```env
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Installation & Running

**Backend**
```bash
cd backend
npm install
node index.js start
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and talks to the API at `http://localhost:3000`.

## Command Line Tools

RepoX ships a small Git-like CLI for local version control, separate from the web app:

```bash
node index.js init                        # initialize a repo
node index.js add myfile.txt               # stage a file
node index.js commit "Added new feature"   # commit staged files
node index.js push                         # push commits to S3
node index.js pull                         # pull commits from S3
node index.js revert --commitId abc123     # revert to a previous commit
```

## API Reference

All routes are relative to `http://localhost:3000`.

**Users**
| Method | Route                | Description            |
|--------|-----------------------|-------------------------|
| POST   | `/signup`              | Register a new user     |
| POST   | `/login`               | Authenticate a user     |
| GET    | `/allUsers`            | List all users          |
| GET    | `/userProfile/:id`     | Get a user's profile    |
| PUT    | `/updateProfile/:id`   | Update a user's profile |
| DELETE | `/deleteProfile/:id`   | Delete a user's account |

**Repositories**
| Method | Route                        | Description                       |
|--------|-------------------------------|------------------------------------|
| POST   | `/create`                     | Create a repository                |
| GET    | `/repo/all`                   | List all repositories              |
| GET    | `/repo/:id`                   | Get a repository by ID             |
| GET    | `/repo/name/:name`            | Get a repository by name           |
| GET    | `/repo/user/:userID`          | Get a user's repositories          |
| PUT    | `/repo/update/:id`            | Update repository content/description |
| PATCH  | `/repo/update/:id`            | Toggle repository visibility       |
| DELETE | `/repo/delete/:id`            | Delete a repository                |
| POST   | `/repo/:id/files`             | Add a file to a repository         |
| GET    | `/repo/:id/files`              | List a repository's files          |
| GET    | `/repo/:id/files/:filePath`   | Get a file's content               |
| DELETE | `/repo/:id/files/:filePath`   | Delete a file                      |

**Issues**
| Method | Route            | Description          |
|--------|-------------------|------------------------|
| POST   | `/issue/create`   | Create an issue        |
| GET    | `/issue/all`      | List all issues        |
| GET    | `/issue/:id`      | Get an issue by ID     |
| PUT    | `/issue/:id`      | Update an issue        |
| DELETE | `/issue/:id`      | Delete an issue        |

## Deployment

RepoX deploys to a DigitalOcean Kubernetes cluster via GitHub Actions. Every push to `main`:

1. Builds Docker images for the frontend and backend
2. Pushes them to Docker Hub, tagged with the commit SHA
3. Applies the manifests in [`kubernetes/`](kubernetes/) (deployments, services, HPA, ingress)
4. Rolls out the new images with zero downtime and waits for the deployment to become healthy

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full setup guide, and [`kubernetes/README.md`](kubernetes/README.md) for the manifest breakdown.

Required GitHub secrets: `DIGITALOCEAN_ACCESS_TOKEN`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`.

## Roadmap

Things I'm actively working on:

- [ ] Lock down `/updateProfile/:id` and `/deleteProfile/:id` so only the owning user (or an admin) can call them
- [ ] Enforce repo `visibility` on reads — private repos currently return their content to any authenticated user
- [ ] Derive a repo's `owner` from the authenticated token instead of trusting the request body
- [ ] Add a `.env.example` for faster local setup
- [ ] Add automated tests for the API
- [ ] Pagination for `/allUsers`, `/repo/all`, and `/issue/all`
