#!/bin/bash
set -e

REGISTRY="portfoliovijay.azurecr.io"
TAG=$1   # build-123

if [ -z "$TAG" ]; then
  echo "Usage: ./update_manifests.sh <IMAGE_TAG>"
  exit 1
fi

cd kubernetes-manifests

echo "Updating backend image..."
sed -i "s|image: ${REGISTRY}/portfolio-backend:.*|image: ${REGISTRY}/portfolio-backend:${TAG}|g" backend-deployment.yaml

echo "Updating frontend image..."
sed -i "s|image: ${REGISTRY}/portfolio-frontend:.*|image: ${REGISTRY}/portfolio-frontend:${TAG}|g" frontend-deployment.yaml

echo "Updated manifests:"
grep "image:" backend-deployment.yaml
grep "image:" frontend-deployment.yaml

# commit and push
git add .
git commit -m "Update images to ${TAG}"
git push origin feature

