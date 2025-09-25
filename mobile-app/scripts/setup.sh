#!/bin/bash

# MathModel Agent Mobile - Setup Script
# This script sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

check_node() {
    print_info "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 16+
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_error "Node.js version 16+ is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

check_java() {
    print_info "Checking Java installation..."
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        print_success "Java found: $JAVA_VERSION"
    else
        print_error "Java is not installed. Please install JDK 11+ from https://adoptium.net/"
        exit 1
    fi
}

check_android_sdk() {
    print_info "Checking Android SDK..."
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME is not set. Please set it to your Android SDK path:"
        echo "export ANDROID_HOME=\$HOME/Android/Sdk"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
        exit 1
    else
        print_success "Android SDK found: $ANDROID_HOME"
    fi
}

install_react_native_cli() {
    print_info "Installing React Native CLI..."
    if command -v react-native &> /dev/null; then
        print_success "React Native CLI already installed"
    else
        npm install -g @react-native-community/cli
        print_success "React Native CLI installed"
    fi
}

install_dependencies() {
    print_info "Installing project dependencies..."
    npm install
    print_success "Dependencies installed"
}

setup_android() {
    print_info "Setting up Android project..."
    cd android
    ./gradlew clean
    cd ..
    print_success "Android project set up"
}

create_gradle_properties() {
    print_info "Creating gradle.properties..."
    cat > android/gradle.properties << EOF
# Project-wide Gradle settings.

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
android.useAndroidX=true
# Automatically convert third-party libraries to use AndroidX
android.enableJetifier=true

# Version of flipper SDK to use with React Native
FLIPPER_VERSION=0.125.0

# Use this property to specify which architecture you want to build.
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Use this property to enable support to the new architecture.
newArchEnabled=false

# Use this property to enable or disable the Hermes JS engine.
hermesEnabled=true
EOF
    print_success "gradle.properties created"
}

create_debug_keystore() {
    print_info "Creating debug keystore..."
    if [ ! -f "android/app/debug.keystore" ]; then
        keytool -genkeypair -v -keystore android/app/debug.keystore -alias androiddebugkey \
            -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android \
            -dname "CN=Android Debug, OU=Android, O=Google Inc., L=Mountain View, S=California, C=US"
        print_success "Debug keystore created"
    else
        print_success "Debug keystore already exists"
    fi
}

setup_metro_config() {
    print_info "Setting up Metro configuration..."
    cat > metro.config.js << EOF
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
EOF
    print_success "Metro configuration set up"
}

create_env_file() {
    print_info "Creating environment file..."
    cat > .env << EOF
# MathModel Agent Mobile Environment Configuration

# API Configuration
API_BASE_URL=http://localhost:8000
API_KEY=your_api_key_here

# Termux Configuration
TERMUX_ENABLED=true
PYTHON_PATH=/data/data/com.termux/files/usr/bin/python3

# Development
DEBUG=true
LOG_LEVEL=info
EOF
    print_success "Environment file created"
}

print_next_steps() {
    echo ""
    echo "=========================================="
    echo "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Configure your API settings in .env file"
    echo "2. Start the Metro bundler: npm start"
    echo "3. Run on Android: npm run android"
    echo "4. Run on iOS: npm run ios (macOS only)"
    echo ""
    echo "For building release versions:"
    echo "./scripts/build.sh release"
    echo ""
    echo "For more information, see README.md"
}

main() {
    echo "=========================================="
    echo "MathModel Agent Mobile - Setup Script"
    echo "=========================================="
    
    check_node
    check_java
    check_android_sdk
    install_react_native_cli
    install_dependencies
    setup_android
    create_gradle_properties
    create_debug_keystore
    setup_metro_config
    create_env_file
    print_next_steps
}

main "$@"