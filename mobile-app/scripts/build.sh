#!/bin/bash

# MathModel Agent Mobile - Build Script
# This script automates the build process for the mobile application

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
BUILD_TYPE="release"
KEYSTORE_PATH="android/app/my-upload-key.keystore"
KEY_ALIAS="my-key-alias"

# Functions
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

check_requirements() {
    print_info "Checking build requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi
    
    # Check React Native CLI
    if ! command -v react-native &> /dev/null; then
        print_warning "React Native CLI not found. Installing..."
        npm install -g @react-native-community/cli
    fi
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME is not set. Please set Android SDK path"
        exit 1
    fi
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install JDK 11+"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

clean_project() {
    print_info "Cleaning project..."
    
    # Clean React Native
    npx react-native start --reset-cache &
    RN_PID=$!
    sleep 5
    kill $RN_PID 2>/dev/null || true
    
    # Clean Android
    cd android
    ./gradlew clean
    cd ..
    
    # Clean node modules
    rm -rf node_modules
    npm install
    
    print_success "Project cleaned"
}

install_dependencies() {
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

build_android_debug() {
    print_info "Building Android debug APK..."
    cd android
    ./gradlew assembleDebug
    cd ..
    
    # Copy APK
    cp android/app/build/outputs/apk/debug/app-debug.apk ./${APP_NAME}-debug-${VERSION}.apk
    print_success "Debug APK built: ${APP_NAME}-debug-${VERSION}.apk"
}

build_android_release() {
    print_info "Building Android release APK..."
    
    # Check if keystore exists
    if [ ! -f "$KEYSTORE_PATH" ]; then
        print_warning "Keystore not found. Creating debug keystore..."
        keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" \
            -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android \
            -dname "CN=MathModel Agent, OU=Mobile, O=MathModel, L=City, S=State, C=US"
    fi
    
    cd android
    ./gradlew assembleRelease
    cd ..
    
    # Copy APK
    cp android/app/build/outputs/apk/release/app-release.apk ./${APP_NAME}-release-${VERSION}.apk
    print_success "Release APK built: ${APP_NAME}-release-${VERSION}.apk"
}

build_android_bundle() {
    print_info "Building Android App Bundle (AAB)..."
    
    cd android
    ./gradlew bundleRelease
    cd ..
    
    # Copy AAB
    cp android/app/build/outputs/bundle/release/app-release.aab ./${APP_NAME}-${VERSION}.aab
    print_success "App Bundle built: ${APP_NAME}-${VERSION}.aab"
}

run_tests() {
    print_info "Running tests..."
    npm test -- --coverage --watchAll=false
    print_success "Tests completed"
}

lint_code() {
    print_info "Running linter..."
    npm run lint
    print_success "Linting completed"
}

# Main script
main() {
    echo "=========================================="
    echo "MathModel Agent Mobile - Build Script"
    echo "Version: $VERSION"
    echo "Build Type: $BUILD_TYPE"
    echo "=========================================="
    
    check_requirements
    
    case "$1" in
        "clean")
            clean_project
            ;;
        "deps")
            install_dependencies
            ;;
        "debug")
            build_android_debug
            ;;
        "release")
            build_android_release
            ;;
        "bundle")
            build_android_bundle
            ;;
        "test")
            run_tests
            ;;
        "lint")
            lint_code
            ;;
        "full")
            clean_project
            install_dependencies
            lint_code
            run_tests
            build_android_release
            build_android_bundle
            ;;
        *)
            echo "Usage: $0 {clean|deps|debug|release|bundle|test|lint|full}"
            echo ""
            echo "Commands:"
            echo "  clean   - Clean project and dependencies"
            echo "  deps    - Install dependencies"
            echo "  debug   - Build debug APK"
            echo "  release - Build release APK"
            echo "  bundle  - Build Android App Bundle"
            echo "  test    - Run tests"
            echo "  lint    - Run linter"
            echo "  full    - Full build process"
            exit 1
            ;;
    esac
    
    print_success "Build process completed!"
}

# Run main function with all arguments
main "$@"