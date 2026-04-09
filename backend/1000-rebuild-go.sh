#!/bin/bash
# Complete Backend Rebuild & Restart Script
# This will ensure the latest rbac_repository.go fixes are applied

echo ""
echo "🧹 Step 1: Cleaning build artifacts..."
rm -f main
rm -rf tmp/*
go clean -cache
go clean -modcache

echo ""
echo "📦 Step 2: Downloading dependencies..."
go mod download
go mod tidy

# Step 6: Build fresh binary
echo ""
echo "🔨 Step 3: Building fresh backend binary..."
go build main.go
