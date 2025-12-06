# SkillVerse Deployment Script for Windows
# =========================================

Write-Host "🚀 SkillVerse Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Host "`nChecking prerequisites..." -ForegroundColor White
    
    # Check Node.js
    try {
        $nodeVersion = node -v
        Write-Success "Node.js installed: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm -v
        Write-Success "npm installed: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed"
        exit 1
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "Git installed: $gitVersion"
    }
    catch {
        Write-Error "Git is not installed"
        exit 1
    }
}

# Build frontend
function Build-Frontend {
    Write-Host "`nBuilding frontend..." -ForegroundColor White
    
    Push-Location frontend
    
    # Install dependencies
    npm ci
    Write-Success "Frontend dependencies installed"
    
    # Build
    npm run build
    Write-Success "Frontend built successfully"
    
    Pop-Location
}

# Build backend
function Build-Backend {
    Write-Host "`nBuilding backend..." -ForegroundColor White
    
    Push-Location backend
    
    # Install production dependencies
    npm ci --only=production
    Write-Success "Backend dependencies installed"
    
    Pop-Location
}

# Deploy with Docker
function Deploy-Docker {
    Write-Host "`nDeploying with Docker..." -ForegroundColor White
    
    try {
        docker --version | Out-Null
    }
    catch {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    # Build images
    docker-compose build
    Write-Success "Docker images built"
    
    # Start containers
    docker-compose up -d
    Write-Success "Containers started"
    
    Write-Host "`nServices running at:" -ForegroundColor White
    Write-Host "  - Frontend: http://localhost:80" -ForegroundColor Cyan
    Write-Host "  - Backend:  http://localhost:5000" -ForegroundColor Cyan
}

# Deploy to Vercel (frontend)
function Deploy-Vercel {
    Write-Host "`nDeploying frontend to Vercel..." -ForegroundColor White
    
    try {
        vercel --version | Out-Null
    }
    catch {
        Write-Warning "Vercel CLI not installed. Installing..."
        npm install -g vercel
    }
    
    Push-Location frontend
    vercel --prod
    Write-Success "Frontend deployed to Vercel"
    
    Pop-Location
}

# Deploy to Railway (backend)
function Deploy-Railway {
    Write-Host "`nDeploying backend to Railway..." -ForegroundColor White
    
    try {
        railway --version | Out-Null
    }
    catch {
        Write-Warning "Railway CLI not installed. Installing..."
        npm install -g @railway/cli
    }
    
    Push-Location backend
    railway up
    Write-Success "Backend deployed to Railway"
    
    Pop-Location
}

# Main menu
function Show-Menu {
    Write-Host "`nSelect deployment option:" -ForegroundColor White
    Write-Host "1) Build only"
    Write-Host "2) Deploy with Docker (local)"
    Write-Host "3) Deploy to Vercel (frontend)"
    Write-Host "4) Deploy to Railway (backend)"
    Write-Host "5) Full cloud deployment (Vercel + Railway)"
    Write-Host "6) Exit"
    
    $choice = Read-Host "`nEnter choice [1-6]"
    
    switch ($choice) {
        "1" {
            Test-Prerequisites
            Build-Frontend
            Build-Backend
            Write-Success "Build complete!"
        }
        "2" {
            Test-Prerequisites
            Deploy-Docker
        }
        "3" {
            Test-Prerequisites
            Build-Frontend
            Deploy-Vercel
        }
        "4" {
            Test-Prerequisites
            Build-Backend
            Deploy-Railway
        }
        "5" {
            Test-Prerequisites
            Build-Frontend
            Build-Backend
            Deploy-Vercel
            Deploy-Railway
            Write-Success "Full deployment complete!"
        }
        "6" {
            Write-Host "Goodbye!" -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Error "Invalid option"
            Show-Menu
        }
    }
}

# Run
Test-Prerequisites
Show-Menu
