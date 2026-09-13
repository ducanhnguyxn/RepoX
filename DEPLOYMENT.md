# RepoX: Beginner's Kubernetes Deployment Guide

This guide walks you through deploying the RepoX application on Kubernetes from start to finish. Each section builds on the previous one, starting from the basics.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up Secrets](#setting-up-secrets)
3. [Creating Your First Deployment](#creating-your-first-deployment)
4. [Creating Services](#creating-services)
5. [Basic Ingress Setup](#basic-ingress-setup)
6. [Setting Up HTTPS with Let's Encrypt](#setting-up-https-with-lets-encrypt)
7. [Advanced Ingress Configuration](#advanced-ingress-configuration)
8. [Monitoring with Prometheus and Grafana](#monitoring-with-prometheus-and-grafana) (Advanced)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:
- A Kubernetes cluster (like Digital Ocean Kubernetes)
- `kubectl` installed and configured
- Docker Hub account (for storing your images)

### Push Docker Images

Always build for the right platform:

```bash
# For Digital Ocean and most cloud providers
docker build --platform linux/amd64 -t yourusername/app-name:tag ./backend
docker build --platform linux/amd64 -t yourusername/app-name:tag ./frontend

# Push to Docker Hub
docker push yourusername/app-name:tag
```

## Setting Up Secrets

Secrets store sensitive data like passwords and API keys.

### Create Docker Hub Secret

```bash
kubectl create namespace repox  # Create namespace first

kubectl create secret docker-registry dockerhub-secret \
  --namespace repox \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email
```

### Create Application Secrets

```bash
kubectl apply -f kubernetes/mongo-secret.yaml
kubectl apply -f kubernetes/jwt-secret.yaml
kubectl apply -f kubernetes/aws-s3-secret.yaml
```

## Creating Your First Deployment

Deployments manage your application pods.

### Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: repox-backend
  namespace: repox
spec:
  replicas: 2
  selector:
    matchLabels:
      app: repox
      component: backend
  template:
    metadata:
      labels:
        app: repox
        component: backend
    spec:
      imagePullSecrets:
      - name: dockerhub-secret
      containers:
      - name: backend
        image: yourusername/repox-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: mongo-uri
```

Apply with:
```bash
kubectl apply -f kubernetes/backend-deployment.yaml
```

### Frontend Deployment

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: repox-frontend
  namespace: repox
spec:
  replicas: 2
  selector:
    matchLabels:
      app: repox
      component: frontend
  template:
    metadata:
      labels:
        app: repox
        component: frontend
    spec:
      imagePullSecrets:
      - name: dockerhub-secret
      containers:
      - name: frontend
        image: yourusername/repox-frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
```

Apply with:
```bash
kubectl apply -f kubernetes/frontend-deployment.yaml
```

## Creating Services

Services expose your deployments to the network.

### Backend Service

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: repox-backend-service
  namespace: repox
spec:
  selector:
    app: repox
    component: backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

### Frontend Service

```yaml
# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: repox-frontend-service
  namespace: repox
spec:
  selector:
    app: repox
    component: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

Apply services:
```bash
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-service.yaml
```

## Basic Ingress Setup

Ingress manages external access to your services.

First, install the NGINX Ingress Controller:

```bash
kubectl create namespace ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

Create a basic ingress:

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: repox-ingress
  namespace: repox
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: repox-backend-service
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: repox-frontend-service
            port:
              number: 80
```

Apply with:
```bash
kubectl apply -f kubernetes/ingress.yaml
```

## Setting Up HTTPS with Let's Encrypt

Free SSL certificates with automatic renewal!

### 1. Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
```

### 2. Create ClusterIssuer

```yaml
# letsencrypt-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: your-email@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
    - http01:
        ingress:
          class: nginx
```

Apply with:
```bash
kubectl apply -f kubernetes/letsencrypt-issuer.yaml
```

## Advanced Ingress Configuration

Now let's set up a domain and SSL:

```yaml
# repox-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: repox-ingress
  namespace: repox
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: repox-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: repox-backend-service
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: repox-frontend-service
            port:
              number: 80
```

For testing without a domain, use nip.io:
```yaml
hosts:
- repox.YOUR_INGRESS_IP.nip.io
```

Apply with:
```bash
kubectl apply -f kubernetes/repox-ingress.yaml
```

## Monitoring with Prometheus and Grafana

For advanced monitoring (set up later):

1. Basic Prometheus setup:
   ```bash
   kubectl create namespace monitoring
   kubectl apply -f kubernetes/prometheus-configmap.yaml
   kubectl apply -f kubernetes/prometheus-deployment.yaml
   kubectl apply -f kubernetes/prometheus-service.yaml
   ```

2. Basic Grafana setup:
   ```bash
   kubectl apply -f kubernetes/grafana-deployment.yaml
   kubectl apply -f kubernetes/grafana-service.yaml
   ```

## Troubleshooting

### Common Issues

#### ImagePullBackOff

This happens when Kubernetes can't pull your Docker images:

1. Check if your images exist in Docker Hub
2. Verify dockerhub-secret is correct
3. Build images for the right platform (linux/amd64)
4. Use imagePullPolicy: Always to force new pulls

#### 401 Unauthorized or 429 Too Many Requests

Docker Hub rate limits can cause these errors:
- Make sure dockerhub-secret is properly configured
- Authenticate with Docker Hub

#### Certificate Errors

If Let's Encrypt certificates aren't working:
1. Check the certificate status: `kubectl get certificate -n repox`
2. Look at certificate requests: `kubectl get certificaterequest -n repox`
3. Check cert-manager logs: `kubectl logs -n cert-manager -l app=cert-manager`

### Useful Commands

```bash
# Check pod status
kubectl get pods -n repox

# See pod logs
kubectl logs pod-name -n repox

# Describe a pod for detailed info
kubectl describe pod pod-name -n repox

# Restart a deployment
kubectl rollout restart deployment deployment-name -n repox
```