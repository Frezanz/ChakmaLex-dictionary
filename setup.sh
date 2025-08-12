#!/bin/bash

# ChakmaLex Setup Script
# This script helps set up the ChakmaLex application with all necessary configurations

echo "🚀 ChakmaLex Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your configuration:"
    echo "   - VITE_GITHUB_TOKEN: Your GitHub personal access token"
    echo "   - VITE_GITHUB_REPO: Your repository (e.g., username/dictionary-data)"
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p uploads/audio
mkdir -p uploads/image

echo "✅ Directories created"

# Create initial data files if they don't exist
if [ ! -f data/words.json ]; then
    echo "📄 Creating initial words.json..."
    echo "[]" > data/words.json
fi

if [ ! -f data/characters.json ]; then
    echo "📄 Creating initial characters.json..."
    echo "[]" > data/characters.json
fi

echo "✅ Data files initialized"

# Check if .gitignore includes necessary entries
if [ ! -f .gitignore ]; then
    echo "📄 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Uploads
uploads/

# Data files (optional - remove if you want to track them)
data/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your GitHub credentials"
echo "2. Create a GitHub repository for dictionary data"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Access the developer console by tapping the logo 10 times"
echo ""
echo "For detailed setup instructions, see API_SETUP.md"
echo ""
echo "Happy coding! 🚀"