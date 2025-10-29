#!/bin/bash

# Wellness360 Backend Setup Script
# This script sets up the development environment for the Wellness360 backend

set -e

echo "🚀 Setting up Wellness360 Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    print_status "Checking MongoDB connection..."
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" --quiet &> /dev/null; then
            print_success "MongoDB is running and accessible"
        else
            print_warning "MongoDB is not running. Please start MongoDB before running the application."
        fi
    else
        print_warning "MongoDB client not found. Please ensure MongoDB is installed and running."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your configuration before running the application"
    else
        print_warning "Environment file already exists. Skipping creation."
    fi
}

# Create logs directory
create_logs_directory() {
    print_status "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
}

# Build the application
build_application() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Run linting
run_linting() {
    print_status "Running linting..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting found issues. Run 'npm run lint:fix' to fix them."
    fi
}

# Check if all required environment variables are set
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        print_error "Environment file not found. Please run the setup script first."
        exit 1
    fi
    
    # Source the .env file
    set -a
    source .env
    set +a
    
    REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET" "GOOGLE_API_KEY")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${MISSING_VARS[*]}"
        print_warning "Please update your .env file with the required values."
        exit 1
    fi
    
    print_success "Environment configuration is valid"
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Wellness360 Backend Setup Script"
    echo "=========================================="
    echo
    
    # Check prerequisites
    check_nodejs
    check_npm
    check_mongodb
    
    echo
    
    # Install dependencies
    install_dependencies
    
    echo
    
    # Create necessary files and directories
    create_env_file
    create_logs_directory
    
    echo
    
    # Build application
    build_application
    
    echo
    
    # Run linting
    run_linting
    
    echo
    
    # Check environment
    check_environment
    
    echo
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo
    print_status "Next steps:"
    echo "1. Update your .env file with the required configuration"
    echo "2. Start MongoDB if it's not already running"
    echo "3. Run 'npm run dev' to start the development server"
    echo "4. Visit http://localhost:5000/api/health to test the API"
    echo
    print_status "Available commands:"
    echo "- npm run dev          : Start development server"
    echo "- npm run build        : Build the application"
    echo "- npm start            : Start production server"
    echo "- npm test             : Run tests"
    echo "- npm run lint         : Run linting"
    echo "- npm run lint:fix     : Fix linting issues"
    echo
}

# Run main function
main "$@"
