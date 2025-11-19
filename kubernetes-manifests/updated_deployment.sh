#!/bin/bash
set -e

REGISTRY="portfoliovijay.azurecr.io"
TAG=$1

cd kubernetes-manifests

echo "Updating backend image..."
sed -i "s|image: ${REGISTRY}/portfolio-backend:.*|image: ${REGISTRY}/portfolio-backend:${TAG}|g" backend-deployment.yaml

echo "Updating frontend image..."
sed -i "s|image: ${REGISTRY}/portfolio-frontend:.*|image: ${REGISTRY}/portfolio-frontend:${TAG}|g" frontend-deployment.yaml

echo "Updated manifests:"
grep "image:" backend-deployment.yaml
grep "image:" frontend-deployment.yaml

echo "done"
