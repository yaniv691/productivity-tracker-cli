#!/bin/bash

# Trigger CI Script - Makes random benign changes and pushes to trigger CI

set -e

echo "🚀 Triggering CI with random benign changes..."

# Array of benign changes to make
changes=(
    "update-readme-timestamp"
    "bump-build-number"
    "add-comment-to-package"
    "update-log-message"
    "modify-whitespace"
    "update-version-comment"
)

# Select a random change type
change_type=${changes[$RANDOM % ${#changes[@]}]}
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
build_number=$RANDOM

echo "📝 Making change type: $change_type"

case $change_type in
    "update-readme-timestamp")
        echo "  └── Updating README timestamp..."
        sed -i.bak "s/Last updated: .*/Last updated: $timestamp/" README.md 2>/dev/null || \
        echo -e "\n\n---\n*Last updated: $timestamp*" >> README.md
        commit_msg="docs: update README timestamp to $timestamp"
        ;;
    
    "bump-build-number")
        echo "  └── Bumping build number in package.json..."
        if grep -q '"buildNumber"' package.json; then
            sed -i.bak "s/\"buildNumber\": [0-9]*/\"buildNumber\": $build_number/" package.json
        else
            # Add build number before the last closing brace
            sed -i.bak '$ s/}/,\n  "buildNumber": '$build_number'\n}/' package.json
        fi
        commit_msg="build: bump build number to $build_number"
        ;;
    
    "add-comment-to-package")
        echo "  └── Adding comment to package.json..."
        # Add a comment field with timestamp
        if grep -q '"comment"' package.json; then
            sed -i.bak "s/\"comment\": \".*\"/\"comment\": \"CI trigger at $timestamp\"/" package.json
        else
            sed -i.bak '$ s/}/,\n  "comment": "CI trigger at '$timestamp'"\n}/' package.json
        fi
        commit_msg="meta: add CI trigger comment for $timestamp"
        ;;
    
    "update-log-message")
        echo "  └── Updating log message in CLI..."
        sed -i.bak "s/Starting Comprehensive Build Process/Starting Comprehensive Build Process (Build $build_number)/" scripts/build.js
        commit_msg="build: update build process log message (#$build_number)"
        ;;
    
    "modify-whitespace")
        echo "  └── Normalizing whitespace in CLI file..."
        # Add some benign whitespace changes
        echo "" >> src/cli.ts
        echo "// CI trigger: $timestamp" >> src/cli.ts
        commit_msg="style: normalize whitespace and add CI marker"
        ;;
    
    "update-version-comment")
        echo "  └── Updating version comment..."
        if grep -q "// Version:" src/cli.ts; then
            sed -i.bak "s|// Version: .*|// Version: dev-$build_number ($timestamp)|" src/cli.ts
        else
            sed -i.bak "1i\\
// Version: dev-$build_number ($timestamp)" src/cli.ts
        fi
        commit_msg="version: update development version marker to dev-$build_number"
        ;;
esac

# Clean up backup files
find . -name "*.bak" -delete 2>/dev/null || true

echo "📋 Staging changes..."
git add .

# Check if there are actually changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes detected, making a minimal change..."
    echo "# CI Trigger Log" > .ci-trigger-log
    echo "Triggered at: $timestamp" >> .ci-trigger-log
    echo "Build number: $build_number" >> .ci-trigger-log
    echo "Change type: $change_type" >> .ci-trigger-log
    git add .ci-trigger-log
    commit_msg="ci: trigger build with log entry ($timestamp)"
fi

echo "💾 Committing changes..."
git commit -m "$commit_msg

Automated CI trigger to test workflow execution.
Timestamp: $timestamp
Build: $build_number"

echo "🚀 Pushing to origin..."
git push origin main

echo "✅ CI trigger complete!"
echo "   📊 Monitor workflow at: https://github.com/yaniv691/productivity-tracker-cli/actions"
echo "   🔍 Change made: $change_type"
echo "   ⏰ Timestamp: $timestamp"