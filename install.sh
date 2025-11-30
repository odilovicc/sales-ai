#!/bin/bash

# Installation script for Telegram Userbot

echo "🤖 Telegram Userbot - Installation Script"
echo "=========================================="
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "Please install Bun from https://bun.sh"
    exit 1
fi

echo "✓ Bun found: $(bun --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Fill in your Telegram API credentials"
echo "3. Add your LLM API key"
echo "4. Run: bun run start"
echo ""
