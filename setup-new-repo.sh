#!/bin/bash
# Script to set up and push to a new GitHub repository

REPO_NAME="claude-sonnet-chat-v2"
GITHUB_USER="ishankorde"

echo "🚀 Setting up new GitHub repository: $REPO_NAME"
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Existing remote 'origin' found:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it to point to the new repo? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "git@github.com:$GITHUB_USER/$REPO_NAME.git"
        echo "✅ Updated remote 'origin' to: git@github.com:$GITHUB_USER/$REPO_NAME.git"
    else
        echo "Keeping existing remote. Exiting."
        exit 0
    fi
else
    git remote add origin "git@github.com:$GITHUB_USER/$REPO_NAME.git"
    echo "✅ Added remote 'origin': git@github.com:$GITHUB_USER/$REPO_NAME.git"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository URL: https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. The repository exists on GitHub"
    echo "   2. You have push access"
    echo "   3. Your SSH key is added to GitHub"
fi

