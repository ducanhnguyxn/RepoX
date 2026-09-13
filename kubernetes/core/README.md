# Core Kubernetes Files

This directory contains the essential Kubernetes configuration files needed to deploy the RepoX application.

## Files

- **Secrets**
  - `mongo-secret.yaml` - MongoDB connection URI
  - `jwt-secret.yaml` - JWT token signing key
  - `aws-s3-secret.yaml` - AWS S3 credentials

- **Deployments**
  - `backend-deployment.yaml` - Backend application pods
  - `frontend-deployment.yaml` - Frontend application pods

- **Services**
  - `backend-service.yaml` - Exposes backend pods
  - `frontend-service.yaml` - Exposes frontend pods

- **Networking**
  - `ingress.yaml` - Basic HTTP ingress
  - `repox-ingress.yaml` - HTTPS ingress with SSL
  - `letsencrypt-issuer.yaml` - Let's Encrypt certificate issuer

## Deployment Order

1. Create namespace: `kubectl create namespace repox`
2. Apply secrets: `kubectl apply -f mongo-secret.yaml -f jwt-secret.yaml -f aws-s3-secret.yaml`
3. Apply deployments: `kubectl apply -f backend-deployment.yaml -f frontend-deployment.yaml`
4. Apply services: `kubectl apply -f backend-service.yaml -f frontend-service.yaml`
5. Apply ingress: `kubectl apply -f ingress.yaml` (or `repox-ingress.yaml` for HTTPS)

For detailed instructions, see the main DEPLOYMENT.md file.
