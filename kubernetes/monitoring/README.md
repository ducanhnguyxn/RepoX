# Kubernetes Monitoring

This directory contains configuration files for monitoring your Kubernetes cluster using Prometheus and Grafana.

## Files

- **Prometheus**
  - `prometheus-configmap.yaml` - Prometheus configuration
  - `prometheus-deployment.yaml` - Prometheus server pods
  - `prometheus-service.yaml` - Exposes Prometheus server

- **Grafana**
  - `grafana-configmap.yaml` - Grafana configuration
  - `grafana-deployment.yaml` - Grafana dashboard pods
  - `grafana-deployment-fixed.yaml` - Improved Grafana configuration
  - `grafana-service.yaml` - Exposes Grafana dashboard

- **Networking**
  - `monitoring-ingress.yaml` - HTTPS access to monitoring tools

## Deployment Instructions

1. Create namespace: `kubectl create namespace monitoring`
2. Deploy Prometheus:
   ```bash
   kubectl apply -f prometheus-configmap.yaml
   kubectl apply -f prometheus-deployment.yaml
   kubectl apply -f prometheus-service.yaml
   ```
3. Deploy Grafana:
   ```bash
   kubectl apply -f grafana-configmap.yaml
   kubectl apply -f grafana-deployment-fixed.yaml
   kubectl apply -f grafana-service.yaml
   ```
4. Apply ingress:
   ```bash
   kubectl apply -f monitoring-ingress.yaml
   ```

## Grafana Setup

After deployment, access Grafana at your configured URL.

Default credentials:
- Username: admin
- Password: admin123

Configure a Prometheus data source:
1. URL: `http://prometheus.monitoring.svc.cluster.local:9090`
2. Access: Server (default)

For detailed instructions, see the main DEPLOYMENT.md file.
