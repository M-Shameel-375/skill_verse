#!/bin/bash

# SkillVerse Deployment Script
# ============================
# This script helps deploy SkillVerse to production

set -e

echo "🚀 SkillVerse Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo ""
    echo "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git installed: $GIT_VERSION"
    else
        print_error "Git is not installed"
        exit 1
    fi
}

# Build frontend
build_frontend() {
    echo ""
    echo "Building frontend..."
    
    cd frontend
    
    # Install dependencies
    npm ci
    print_success "Frontend dependencies installed"
    
    # Build
    npm run build
    print_success "Frontend built successfully"
    
    cd ..
}

# Build backend
build_backend() {
    echo ""
    echo "Building backend..."
    
    cd backend
    
    # Install production dependencies
    npm ci --only=production
    print_success "Backend dependencies installed"
    
    cd ..
}

# Deploy with Docker
deploy_docker() {
    echo ""
    echo "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Build images
    docker-compose build
    print_success "Docker images built"
    
    # Start containers
    docker-compose up -d
    print_success "Containers started"
    
    echo ""
    echo "Services running at:"
    echo "  - Frontend: http://localhost:80"
    echo "  - Backend:  http://localhost:5000"
}

# Deploy to Vercel (frontend)
deploy_vercel() {
    echo ""
    echo "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not installed. Installing..."
        npm install -g vercel
    fi
    
    cd frontend
    vercel --prod
    print_success "Frontend deployed to Vercel"
    
    cd ..
}

# Deploy to Railway (backend)
deploy_railway() {
    echo ""
    echo "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not installed. Installing..."
        npm install -g @railway/cli
    fi
    
    cd backend
    railway up
    print_success "Backend deployed to Railway"
    
    cd ..
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Build only"
    echo "2) Deploy with Docker (local)"
    echo "3) Deploy to Vercel (frontend)"
    echo "4) Deploy to Railway (backend)"
    echo "5) Full cloud deployment (Vercel + Railway)"
    echo "6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            check_prerequisites
            build_frontend
            build_backend
            print_success "Build complete!"
            ;;
        2)
            check_prerequisites
            deploy_docker
            ;;
        3)
            check_prerequisites
            build_frontend
            deploy_vercel
            ;;
        4)
            check_prerequisites
            build_backend
            deploy_railway
            ;;
        5)
            check_prerequisites
            build_frontend
            build_backend
            deploy_vercel
            deploy_railway
            print_success "Full deployment complete!"
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Run
check_prerequisites
show_menu
