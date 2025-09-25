#!/bin/bash

# MathModel Agent Mobile - Deployment Script
# This script handles deployment to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="MathModelAgentMobile"
VERSION="1.0.0"
PACKAGE_NAME="com.mathmodelagent.mobile"

print_info() {
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

deploy_to_play_store() {
    print_info "Deploying to Google Play Store..."
    
    # Check if AAB exists
    AAB_FILE="${APP_NAME}-${VERSION}.aab"
    if [ ! -f "$AAB_FILE" ]; then
        print_error "AAB file not found. Please build it first: ./scripts/build.sh bundle"
        exit 1
    fi
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK not found. Please install it first."
        exit 1
    fi
    
    # Upload to Play Store
    gcloud auth login
    gcloud config set project your-project-id
    
    print_info "Uploading AAB to Play Store..."
    gcloud app deploy "$AAB_FILE" --version="$VERSION"
    
    print_success "Successfully uploaded to Play Store"
}

deploy_to_firebase() {
    print_info "Deploying to Firebase App Distribution..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI not found. Please install it first: npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if APK exists
    APK_FILE="${APP_NAME}-release-${VERSION}.apk"
    if [ ! -f "$APK_FILE" ]; then
        print_error "APK file not found. Please build it first: ./scripts/build.sh release"
        exit 1
    fi
    
    # Login to Firebase
    firebase login
    
    # Upload to Firebase App Distribution
    firebase appdistribution:distribute "$APK_FILE" \
        --app "$PACKAGE_NAME" \
        --groups "testers" \
        --release-notes "Version $VERSION - MathModel Agent Mobile"
    
    print_success "Successfully uploaded to Firebase App Distribution"
}

deploy_to_github_releases() {
    print_info "Deploying to GitHub Releases..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not found. Please install it first."
        exit 1
    fi
    
    # Check if files exist
    APK_FILE="${APP_NAME}-release-${VERSION}.apk"
    AAB_FILE="${APP_NAME}-${VERSION}.aab"
    
    if [ ! -f "$APK_FILE" ] || [ ! -f "$AAB_FILE" ]; then
        print_error "Release files not found. Please build them first: ./scripts/build.sh full"
        exit 1
    fi
    
    # Create release
    gh release create "v$VERSION" \
        "$APK_FILE" \
        "$AAB_FILE" \
        --title "MathModel Agent Mobile v$VERSION" \
        --notes "## What's New
- Initial release of MathModel Agent Mobile
- Multi-agent collaboration for mathematical modeling
- Integrated Termux terminal environment
- Complete mobile UI with file management
- Support for Python scientific computing

## Installation
Download the APK file and install on Android 7.0+ devices.

## Features
- 🤖 Multi-agent collaboration
- 💻 Built-in Termux terminal
- 📱 Mobile-optimized UI
- 🔧 Full Python environment
- 📊 Data analysis and visualization"
    
    print_success "Successfully created GitHub release"
}

deploy_to_local_server() {
    print_info "Deploying to local server..."
    
    # Configuration
    SERVER_HOST="your-server.com"
    SERVER_USER="deploy"
    SERVER_PATH="/var/www/mathmodel-agent-mobile"
    
    # Check if files exist
    APK_FILE="${APP_NAME}-release-${VERSION}.apk"
    if [ ! -f "$APK_FILE" ]; then
        print_error "APK file not found. Please build it first: ./scripts/build.sh release"
        exit 1
    fi
    
    # Upload files
    print_info "Uploading files to server..."
    scp "$APK_FILE" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    
    # Update server
    print_info "Updating server..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && ./update.sh $VERSION"
    
    print_success "Successfully deployed to local server"
}

create_installer() {
    print_info "Creating installer package..."
    
    # Create installer directory
    INSTALLER_DIR="installer"
    mkdir -p "$INSTALLER_DIR"
    
    # Copy files
    cp "${APP_NAME}-release-${VERSION}.apk" "$INSTALLER_DIR/"
    cp README.md "$INSTALLER_DIR/"
    cp LICENSE "$INSTALLER_DIR/" 2>/dev/null || true
    
    # Create install script
    cat > "$INSTALLER_DIR/install.sh" << EOF
#!/bin/bash
# MathModel Agent Mobile Installer

echo "Installing MathModel Agent Mobile..."
echo "This will install the APK on your Android device."
echo "Make sure USB debugging is enabled."

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo "Error: ADB not found. Please install Android SDK platform-tools."
    exit 1
fi

# Install APK
adb install -r ${APP_NAME}-release-${VERSION}.apk

if [ \$? -eq 0 ]; then
    echo "Installation successful!"
    echo "You can now launch MathModel Agent Mobile from your app drawer."
else
    echo "Installation failed. Please check the error messages above."
    exit 1
fi
EOF
    
    chmod +x "$INSTALLER_DIR/install.sh"
    
    # Create ZIP package
    ZIP_FILE="${APP_NAME}-installer-${VERSION}.zip"
    cd "$INSTALLER_DIR"
    zip -r "../$ZIP_FILE" .
    cd ..
    rm -rf "$INSTALLER_DIR"
    
    print_success "Installer package created: $ZIP_FILE"
}

print_usage() {
    echo "Usage: $0 {playstore|firebase|github|local|installer}"
    echo ""
    echo "Commands:"
    echo "  playstore - Deploy to Google Play Store (requires AAB)"
    echo "  firebase  - Deploy to Firebase App Distribution (requires APK)"
    echo "  github    - Create GitHub release (requires APK and AAB)"
    echo "  local     - Deploy to local server (requires APK)"
    echo "  installer - Create installer package (requires APK)"
    echo ""
    echo "Prerequisites:"
    echo "  - Build the app first: ./scripts/build.sh full"
    echo "  - Configure deployment credentials"
    echo "  - Install required CLI tools"
}

main() {
    echo "=========================================="
    echo "MathModel Agent Mobile - Deployment Script"
    echo "Version: $VERSION"
    echo "=========================================="
    
    case "$1" in
        "playstore")
            deploy_to_play_store
            ;;
        "firebase")
            deploy_to_firebase
            ;;
        "github")
            deploy_to_github_releases
            ;;
        "local")
            deploy_to_local_server
            ;;
        "installer")
            create_installer
            ;;
        *)
            print_usage
            exit 1
            ;;
    esac
    
    print_success "Deployment completed!"
}

main "$@"