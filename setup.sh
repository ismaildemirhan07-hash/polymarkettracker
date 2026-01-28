#!/bin/bash

echo "🚀 Polymarket Tracker Setup Script"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
    echo "   Required: DATABASE_URL"
    read -p "Press enter to continue after editing .env..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Ask about seeding
read -p "Would you like to seed sample data? (y/n): " seed_choice
if [ "$seed_choice" = "y" ]; then
    echo "🌱 Seeding database..."
    npm run prisma:seed
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The app will be available at http://localhost:5000"
echo ""
echo "API endpoints are available at http://localhost:5000/api/*"
echo "Health check: http://localhost:5000/health"
